import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { toIsoString } from "@/lib/utils";
import { getFirestoreDb } from "@/firebase/firestore";
import { getFirebaseStorage } from "@/firebase/storage";
import type {
  CreateGenerationJobInput,
  DestinationKey,
  GeneratedImage,
  GenerationJob,
  ImageCount,
  OccasionKey,
} from "@/types/domain";

function getScenePackId(destination: DestinationKey) {
  return `scene-pack-${destination}-v1`;
}

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

function normalizeCustomTravelRequest(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, 900) : null;
}

function normalizeImageCount(value: unknown): ImageCount {
  switch (value) {
    case 2:
    case 8:
    case 10:
    case 12:
      return value;
    default:
      return 8;
  }
}

function normalizeOccasion(value: unknown): OccasionKey {
  switch (value) {
    case "spring":
    case "summer":
    case "autumn":
    case "winter":
    case "christmas":
    case "new-year":
    case "birthday":
    case "wedding":
    case "anniversary":
    case "business":
    case "red-carpet":
      return value;
    default:
      return "none";
  }
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
    customTravelRequest: normalizeCustomTravelRequest(data.customTravelRequest),
    style: data.style as GenerationJob["style"],
    imageCount: normalizeImageCount(data.imageCount),
    occasion: normalizeOccasion(data.occasion),
    status: normalizeGenerationJobStatus(data.status),
    scenePackId: String(data.scenePackId ?? ""),
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
    errorMessage: data.errorMessage ? String(data.errorMessage) : null,
    providerId: data.providerId ? String(data.providerId) : null,
    processedSceneCount:
      typeof data.processedSceneCount === "number"
        ? data.processedSceneCount
        : null,
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

export async function getJobImagesOnce(userId: string, jobId: string) {
  const db = getFirestoreDb();
  const imagesQuery = query(
    collection(db, "generatedImages"),
    where("userId", "==", userId),
    where("jobId", "==", jobId),
    orderBy("createdAt", "asc"),
  );
  const snapshot = await getDocs(imagesQuery);

  return snapshot.docs.map((item) =>
    mapImage(item.id, item.data() as Record<string, unknown>),
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

export async function getGeneratedImagesOnce(userId: string) {
  const db = getFirestoreDb();
  const imagesQuery = query(
    collection(db, "generatedImages"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );
  const snapshot = await getDocs(imagesQuery);

  return snapshot.docs.map((item) =>
    mapImage(item.id, item.data() as Record<string, unknown>),
  );
}

export async function createGenerationJob({
  userId,
  input,
}: {
  userId: string;
  input: CreateGenerationJobInput;
}) {
  const db = getFirestoreDb();
  const jobRef = doc(collection(db, "generationJobs"));
  const scenePackId = getScenePackId(input.destination);

  await setDoc(jobRef, {
    id: jobRef.id,
    userId,
    primaryProfileId: input.primaryProfileId,
    primaryProfileName: input.primaryProfileName,
    mode: input.mode,
    companionProfileId: input.companionProfileId,
    companionProfileName: input.companionProfileName,
    destination: input.destination,
    customTravelRequest: normalizeCustomTravelRequest(input.customTravelRequest),
    style: input.style,
    imageCount: input.imageCount,
    occasion: input.occasion,
    status: "pending",
    scenePackId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    errorMessage: null,
  });

  return jobRef.id;
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

export async function deleteGeneratedImage(userId: string, imageId: string) {
  const db = getFirestoreDb();
  const storage = getFirebaseStorage();
  const imageRef = doc(db, "generatedImages", imageId);
  const imageSnapshot = await getDoc(imageRef);

  if (!imageSnapshot.exists()) {
    return;
  }

  const image = mapImage(
    imageSnapshot.id,
    imageSnapshot.data() as Record<string, unknown>,
  );

  if (image.userId !== userId) {
    throw new Error("You do not have access to delete this image.");
  }

  if (image.storagePath) {
    await deleteObject(ref(storage, image.storagePath)).catch(() => undefined);
  }

  await deleteDoc(imageRef);
}
