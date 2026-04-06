import { FieldValue, getFirestore } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { buildScenePromptDefinitions } from "./prompt-builder";
import { MockGenerationProvider } from "./mock-provider";
import { getSceneSelection } from "./scene-packs";
import type {
  GenerationInput,
  GenerationJobRecord,
  GenerationRunResult,
  ProfileChecklistCoverage,
  ProfileRecord,
} from "./types";

const provider = new MockGenerationProvider();

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNullableString(value: unknown) {
  return value === null ? null : asString(value);
}

function isImageCount(value: unknown): value is 8 | 10 | 12 {
  return value === 8 || value === 10 || value === 12;
}

function mapChecklistCoverage(value: unknown): ProfileChecklistCoverage {
  const candidate = value as Record<string, unknown> | undefined;

  return {
    frontPortrait: Boolean(candidate?.frontPortrait),
    leftSide: Boolean(candidate?.leftSide),
    rightSide: Boolean(candidate?.rightSide),
    halfBody: Boolean(candidate?.halfBody),
    fullBody: Boolean(candidate?.fullBody),
    neutralExpression: Boolean(candidate?.neutralExpression),
    smiling: Boolean(candidate?.smiling),
    goodLighting: Boolean(candidate?.goodLighting),
  };
}

function mapProfileRecord(id: string, data: Record<string, unknown>): ProfileRecord {
  return {
    id,
    userId: asString(data.userId),
    displayName: asString(data.displayName, "Untitled profile"),
    relationshipType: (data.relationshipType as ProfileRecord["relationshipType"]) ?? "other",
    notes: asString(data.notes),
    photoCount: Number(data.photoCount ?? 0),
    readinessStatus: data.readinessStatus === "ready" ? "ready" : "incomplete",
    checklistCoverage: mapChecklistCoverage(data.checklistCoverage),
  };
}

function mapJobRecord(id: string, data: Record<string, unknown>): GenerationJobRecord {
  return {
    id,
    userId: asString(data.userId),
    primaryProfileId: asString(data.primaryProfileId),
    primaryProfileName: asString(data.primaryProfileName),
    mode: data.mode === "companion" ? "companion" : "solo",
    companionProfileId: asNullableString(data.companionProfileId),
    companionProfileName: asNullableString(data.companionProfileName),
    destination: (data.destination as GenerationJobRecord["destination"]) ?? "paris",
    style: (data.style as GenerationJobRecord["style"]) ?? "casual-travel",
    imageCount: isImageCount(data.imageCount) ? data.imageCount : 8,
    status: (data.status as GenerationJobRecord["status"]) ?? "pending",
    scenePackId: asString(data.scenePackId),
    errorMessage: asNullableString(data.errorMessage),
  };
}

function createGeneratedImageId(jobId: string, sceneKey: string) {
  return `${jobId}_${sceneKey}`.replace(/[^a-zA-Z0-9_-]/g, "-");
}

async function getOwnedProfile(userId: string, profileId: string) {
  const db = getFirestore();
  const snapshot = await db.collection("profiles").doc(profileId).get();

  if (!snapshot.exists) {
    throw new Error(`Profile ${profileId} was not found.`);
  }

  const profile = mapProfileRecord(
    snapshot.id,
    snapshot.data() as Record<string, unknown>,
  );

  if (profile.userId !== userId) {
    throw new Error(`Profile ${profileId} does not belong to this user.`);
  }

  return profile;
}

async function buildGenerationInput(jobId: string) {
  const db = getFirestore();
  const jobSnapshot = await db.collection("generationJobs").doc(jobId).get();

  if (!jobSnapshot.exists) {
    throw new Error(`Generation job ${jobId} does not exist.`);
  }

  const job = mapJobRecord(
    jobSnapshot.id,
    jobSnapshot.data() as Record<string, unknown>,
  );
  const primaryProfile = await getOwnedProfile(job.userId, job.primaryProfileId);
  const companionProfile =
    job.mode === "companion" && job.companionProfileId
      ? await getOwnedProfile(job.userId, job.companionProfileId)
      : null;

  const input: GenerationInput = {
    jobId: job.id,
    userId: job.userId,
    mode: job.mode,
    destination: job.destination,
    style: job.style,
    imageCount: job.imageCount,
    scenePackId: job.scenePackId,
    primaryProfile,
    companionProfile,
  };

  return { job, input };
}

async function processGenerationJob(input: GenerationInput): Promise<GenerationRunResult> {
  const scenes = getSceneSelection(input.destination, input.imageCount);
  const scenePrompts = buildScenePromptDefinitions({ input, scenes });
  const images = await provider.generate({
    input,
    scenes,
    scenePrompts,
  });

  return {
    jobId: input.jobId,
    providerId: provider.providerId,
    status: "completed",
    sceneCount: images.length,
    images,
    errorMessage: null,
  };
}

async function claimPendingJob(jobId: string) {
  const db = getFirestore();
  const jobRef = db.collection("generationJobs").doc(jobId);

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(jobRef);

    if (!snapshot.exists) {
      return false;
    }

    if (snapshot.get("status") !== "pending") {
      return false;
    }

    transaction.update(jobRef, {
      status: "processing",
      errorMessage: null,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return true;
  });
}

async function markJobFailed(jobId: string, message: string) {
  const db = getFirestore();

  await db.collection("generationJobs").doc(jobId).update({
    status: "failed",
    errorMessage: message,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function processCreatedGenerationJob(jobId: string) {
  const claimed = await claimPendingJob(jobId);

  if (!claimed) {
    logger.info("Skipping generation job because it is no longer pending.", {
      jobId,
    });
    return;
  }

  try {
    const { job, input } = await buildGenerationInput(jobId);
    const result = await processGenerationJob(input);
    const db = getFirestore();
    const batch = db.batch();
    const jobRef = db.collection("generationJobs").doc(jobId);

    for (const image of result.images) {
      const imageRef = db
        .collection("generatedImages")
        .doc(createGeneratedImageId(job.id, image.sceneKey));

      batch.set(imageRef, {
        id: imageRef.id,
        userId: input.userId,
        jobId: input.jobId,
        sceneKey: image.sceneKey,
        imageURL: image.imageURL,
        storagePath: image.storagePath,
        prompt: image.prompt,
        providerId: result.providerId,
        providerAssetId: image.providerAssetId,
        providerMetadata: image.providerMetadata,
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    batch.update(jobRef, {
      status: result.status,
      errorMessage: result.errorMessage,
      providerId: result.providerId,
      processedSceneCount: result.sceneCount,
      updatedAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    logger.info("Completed backend mock generation job.", {
      jobId,
      userId: input.userId,
      sceneCount: result.sceneCount,
      providerId: result.providerId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Generation processing failed.";

    logger.error("Failed backend generation job.", {
      jobId,
      error: message,
    });

    await markJobFailed(jobId, message);
  }
}
