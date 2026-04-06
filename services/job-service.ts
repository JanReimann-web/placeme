import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import { getScenePack } from "@/lib/constants";
import { toIsoString } from "@/lib/utils";
import { getFirestoreDb } from "@/firebase/firestore";
import { processGenerationJob } from "@/services/generation/job-orchestrator";
import type {
  CreateGenerationJobInput,
  GeneratedImage,
  GenerationJob,
} from "@/types/domain";
import type {
  GenerationInput,
  JobStatusUpdate,
} from "@/types/generation";

function normalizeGenerationJobStatus(value: unknown): GenerationJob["status"] {
  switch (value) {
    case "pending":
    case "processing":
    case "completed":
    case "failed":
      return value;
    default:
      return "pending";
  }
}

function buildJobStatusUpdatePayload(update: JobStatusUpdate) {
  return {
    status: update.status,
    updatedAt: serverTimestamp(),
    errorMessage: update.errorMessage,
  };
}

function mapJob(id: string, data: Record<string, unknown>): GenerationJob {
  return {
    id,
    userId: String(data.userId ?? ""),
    primaryProfileId: String(data.primaryProfileId ?? ""),
    primaryProfileName: String(data.primaryProfileName ?? ""),
    mode: data.mode === "companion" ? "companion" : "solo",
    companionProfileId:
      data.companionProfileId === null ? null : String(data.companionProfileId ?? ""),
    companionProfileName:
      data.companionProfileName === null ? null : String(data.companionProfileName ?? ""),
    destination: data.destination as GenerationJob["destination"],
    style: data.style as GenerationJob["style"],
    imageCount: (data.imageCount as GenerationJob["imageCount"]) ?? 8,
    status: normalizeGenerationJobStatus(data.status),
    scenePackId: String(data.scenePackId ?? ""),
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
    errorMessage: data.errorMessage ? String(data.errorMessage) : null,
  };
}

function mapImage(id: string, data: Record<string, unknown>): GeneratedImage {
  return {
    id,
    userId: String(data.userId ?? ""),
    jobId: String(data.jobId ?? ""),
    sceneKey: String(data.sceneKey ?? ""),
    imageURL: String(data.imageURL ?? ""),
    storagePath: String(data.storagePath ?? ""),
    createdAt: toIsoString(data.createdAt),
  };
}

export function subscribeJobs(
  userId: string,
  onData: (jobs: GenerationJob[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const db = getFirestoreDb();
  const jobsQuery = query(
    collection(db, "generationJobs"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(
    jobsQuery,
    (snapshot) => {
      onData(
        snapshot.docs.map((item) =>
          mapJob(item.id, item.data() as Record<string, unknown>),
        ),
      );
    },
    (error) => onError(error),
  );
}

export function subscribeJob(
  userId: string,
  jobId: string,
  onData: (job: GenerationJob | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const db = getFirestoreDb();

  return onSnapshot(
    doc(db, "generationJobs", jobId),
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null);
        return;
      }

      const job = mapJob(snapshot.id, snapshot.data() as Record<string, unknown>);
      onData(job.userId === userId ? job : null);
    },
    (error) => onError(error),
  );
}

export function subscribeJobImages(
  userId: string,
  jobId: string,
  onData: (images: GeneratedImage[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const db = getFirestoreDb();
  const imagesQuery = query(
    collection(db, "generatedImages"),
    where("userId", "==", userId),
    where("jobId", "==", jobId),
    orderBy("createdAt", "asc"),
  );

  return onSnapshot(
    imagesQuery,
    (snapshot) => {
      onData(
        snapshot.docs.map((item) =>
          mapImage(item.id, item.data() as Record<string, unknown>),
        ),
      );
    },
    (error) => onError(error),
  );
}

export function subscribeGeneratedImages(
  userId: string,
  onData: (images: GeneratedImage[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const db = getFirestoreDb();
  const imagesQuery = query(
    collection(db, "generatedImages"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(
    imagesQuery,
    (snapshot) => {
      onData(
        snapshot.docs.map((item) =>
          mapImage(item.id, item.data() as Record<string, unknown>),
        ),
      );
    },
    (error) => onError(error),
  );
}

export async function createGenerationJob({
  userId,
  input,
  primaryProfile,
  companionProfile,
}: {
  userId: string;
  input: CreateGenerationJobInput;
  primaryProfile: GenerationInput["primaryProfile"];
  companionProfile?: GenerationInput["companionProfile"];
}) {
  const db = getFirestoreDb();
  const jobRef = doc(collection(db, "generationJobs"));
  const scenePackId = getScenePack(input.destination).id;

  await setDoc(jobRef, {
    id: jobRef.id,
    userId,
    primaryProfileId: input.primaryProfileId,
    primaryProfileName: input.primaryProfileName,
    mode: input.mode,
    companionProfileId: input.companionProfileId,
    companionProfileName: input.companionProfileName,
    destination: input.destination,
    style: input.style,
    imageCount: input.imageCount,
    status: "pending",
    scenePackId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    errorMessage: null,
  });

  void dispatchGenerationJobProcessing({
    jobId: jobRef.id,
    userId,
    mode: input.mode,
    destination: input.destination,
    style: input.style,
    imageCount: input.imageCount,
    scenePackId,
    primaryProfile,
    companionProfile,
  });

  return jobRef.id;
}

function dispatchGenerationJobProcessing(input: GenerationInput) {
  // TODO(Gemini): replace this browser-side mock dispatch with a trusted backend queue or route handler.
  // TODO(Gemini): never call Gemini image generation directly from the browser.
  void runMockPipeline(input);
}

async function runMockPipeline(input: GenerationInput) {
  const db = getFirestoreDb();
  const jobRef = doc(db, "generationJobs", input.jobId);

  try {
    await updateDoc(
      jobRef,
      buildJobStatusUpdatePayload({
        jobId: input.jobId,
        userId: input.userId,
        status: "processing",
        errorMessage: null,
      }),
    );

    const result = await processGenerationJob(input);

    const batch = writeBatch(db);

    for (const image of result.images) {
      const imageRef = doc(collection(db, "generatedImages"));
      batch.set(imageRef, {
        id: imageRef.id,
        userId: input.userId,
        jobId: input.jobId,
        sceneKey: image.sceneKey,
        imageURL: image.imageURL,
        storagePath: image.storagePath,
        createdAt: serverTimestamp(),
      });
    }

    batch.update(
      jobRef,
      buildJobStatusUpdatePayload({
        jobId: input.jobId,
        userId: input.userId,
        status: result.status,
        errorMessage: result.errorMessage,
        providerId: result.providerId,
        processedSceneCount: result.sceneCount,
      }),
    );

    await batch.commit();
  } catch (error) {
    await updateDoc(
      jobRef,
      buildJobStatusUpdatePayload({
        jobId: input.jobId,
        userId: input.userId,
        status: "failed",
        errorMessage:
          error instanceof Error ? error.message : "Mock generation failed.",
      }),
    );
  }
}

export async function getJob(userId: string, jobId: string) {
  const db = getFirestoreDb();
  const snapshot = await getDoc(doc(db, "generationJobs", jobId));

  if (!snapshot.exists()) {
    return null;
  }

  const job = mapJob(snapshot.id, snapshot.data() as Record<string, unknown>);
  return job.userId === userId ? job : null;
}
