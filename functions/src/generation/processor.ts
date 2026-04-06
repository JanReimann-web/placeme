import { randomUUID } from "node:crypto";
import { getStorage } from "firebase-admin/storage";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { GeminiGenerationProvider } from "./gemini-provider";
import { MockGenerationProvider } from "./mock-provider";
import { buildScenePromptDefinitions } from "./prompt-builder";
import { listProfilePhotoRecords, prepareReferenceImages } from "./reference-images";
import type { GenerationProvider } from "./provider";
import { getSceneSelection } from "./scene-packs";
import type {
  GenerationInput,
  GenerationJobRecord,
  GenerationRunResult,
  ProfileChecklistCoverage,
  ProfileRecord,
  ProviderGeneratedImage,
} from "./types";

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

function createGeneratedStoragePath({
  userId,
  jobId,
  sceneKey,
  fileExtension,
}: {
  userId: string;
  jobId: string;
  sceneKey: string;
  fileExtension: string;
}) {
  const safeSceneKey = sceneKey.replace(/[^a-zA-Z0-9_-]/g, "-");
  return `users/${userId}/generated/${jobId}/${safeSceneKey}.${fileExtension}`;
}

function buildStorageDownloadUrl(bucketName: string, storagePath: string, token: string) {
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(storagePath)}?alt=media&token=${token}`;
}

function getGenerationProvider(): GenerationProvider {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    return new GeminiGenerationProvider(apiKey);
  }

  logger.warn("GEMINI_API_KEY secret is missing at runtime. Falling back to mock provider.");
  return new MockGenerationProvider();
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
  const primaryReferencePhotos = await listProfilePhotoRecords(
    job.userId,
    job.primaryProfileId,
  );
  const companionReferencePhotos =
    companionProfile && job.companionProfileId
      ? await listProfilePhotoRecords(job.userId, job.companionProfileId)
      : [];

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
    primaryReferencePhotos,
    companionReferencePhotos,
  };

  return { job, input };
}

async function uploadGeneratedImage({
  input,
  image,
  providerId,
}: {
  input: GenerationInput;
  image: ProviderGeneratedImage;
  providerId: string;
}) {
  const bucket = getStorage().bucket();
  const storagePath = createGeneratedStoragePath({
    userId: input.userId,
    jobId: input.jobId,
    sceneKey: image.sceneKey,
    fileExtension: image.fileExtension,
  });
  const token = randomUUID();

  await bucket.file(storagePath).save(image.imageData, {
    resumable: false,
    metadata: {
      contentType: image.mimeType,
      cacheControl: "public,max-age=31536000,immutable",
      metadata: {
        firebaseStorageDownloadTokens: token,
        jobId: input.jobId,
        sceneKey: image.sceneKey,
        providerId,
      },
    },
  });

  return {
    sceneKey: image.sceneKey,
    imageURL: buildStorageDownloadUrl(bucket.name, storagePath, token),
    storagePath,
    prompt: image.prompt,
    providerAssetId: image.providerAssetId,
    providerMetadata: image.providerMetadata,
  };
}

async function processGenerationJob(input: GenerationInput): Promise<GenerationRunResult> {
  const provider = getGenerationProvider();
  const scenes = getSceneSelection(input.destination, input.imageCount);
  const scenePrompts = buildScenePromptDefinitions({ input, scenes });
  const referenceImages = await prepareReferenceImages(input);
  const providerImages = await provider.generate({
    input,
    scenes,
    scenePrompts,
    referenceImages,
  });
  const images = await Promise.all(
    providerImages.map((image) =>
      uploadGeneratedImage({ input, image, providerId: provider.providerId }),
    ),
  );

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

    logger.info("Completed backend generation job.", {
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
