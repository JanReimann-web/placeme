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
  Profile,
} from "@/types/domain";

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
    status: (data.status as GenerationJob["status"]) ?? "pending",
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
  primaryProfile: Profile;
  companionProfile?: Profile | null;
}) {
  const db = getFirestoreDb();
  const jobRef = doc(collection(db, "generationJobs"));

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
    scenePackId: getScenePack(input.destination).id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    errorMessage: null,
  });

  void runMockPipeline({
    jobId: jobRef.id,
    userId,
    input,
    primaryProfile,
    companionProfile,
  });

  return jobRef.id;
}

async function runMockPipeline({
  jobId,
  userId,
  input,
  primaryProfile,
  companionProfile,
}: {
  jobId: string;
  userId: string;
  input: CreateGenerationJobInput;
  primaryProfile: Profile;
  companionProfile?: Profile | null;
}) {
  const db = getFirestoreDb();
  const jobRef = doc(db, "generationJobs", jobId);

  try {
    await updateDoc(jobRef, {
      status: "processing",
      updatedAt: serverTimestamp(),
      errorMessage: null,
    });

    const images = await processGenerationJob({
      jobId,
      userId,
      destination: input.destination,
      style: input.style,
      imageCount: input.imageCount,
      primaryProfile,
      companionProfile,
    });

    const batch = writeBatch(db);

    for (const image of images) {
      const imageRef = doc(collection(db, "generatedImages"));
      batch.set(imageRef, {
        id: imageRef.id,
        userId,
        jobId,
        sceneKey: image.sceneKey,
        imageURL: image.imageURL,
        storagePath: image.storagePath,
        createdAt: serverTimestamp(),
      });
    }

    batch.update(jobRef, {
      status: "completed",
      updatedAt: serverTimestamp(),
      errorMessage: null,
    });

    await batch.commit();
  } catch (error) {
    await updateDoc(jobRef, {
      status: "failed",
      updatedAt: serverTimestamp(),
      errorMessage:
        error instanceof Error ? error.message : "Mock generation failed.",
    });
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
