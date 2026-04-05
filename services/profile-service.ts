import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { getFirestoreDb } from "@/firebase/firestore";
import { getFirebaseStorage } from "@/firebase/storage";
import { buildChecklistCoverage, createEmptyChecklistCoverage, getProfileReadinessStatus } from "@/lib/readiness";
import { sanitizeFilename, toIsoString } from "@/lib/utils";
import type {
  ChecklistTag,
  CreateProfileInput,
  Profile,
  ProfileChecklistCoverage,
  ProfilePhoto,
  UpdateProfileInput,
} from "@/types/domain";

function normalizeCoverage(value: unknown): ProfileChecklistCoverage {
  const coverage = createEmptyChecklistCoverage();

  if (!value || typeof value !== "object") {
    return coverage;
  }

  for (const key of Object.keys(coverage) as Array<keyof ProfileChecklistCoverage>) {
    coverage[key] = Boolean((value as Record<string, unknown>)[key]);
  }

  return coverage;
}

function mapProfile(id: string, data: Record<string, unknown>): Profile {
  return {
    id,
    userId: String(data.userId ?? ""),
    displayName: String(data.displayName ?? "Untitled profile"),
    relationshipType: (data.relationshipType as Profile["relationshipType"]) ?? "other",
    notes: String(data.notes ?? ""),
    photoCount: Number(data.photoCount ?? 0),
    readinessStatus: data.readinessStatus === "ready" ? "ready" : "incomplete",
    checklistCoverage: normalizeCoverage(data.checklistCoverage),
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
  };
}

function mapProfilePhoto(id: string, data: Record<string, unknown>): ProfilePhoto {
  return {
    id,
    userId: String(data.userId ?? ""),
    profileId: String(data.profileId ?? ""),
    storagePath: String(data.storagePath ?? ""),
    downloadURL: String(data.downloadURL ?? ""),
    tags: Array.isArray(data.tags) ? (data.tags as ChecklistTag[]) : [],
    uploadedAt: toIsoString(data.uploadedAt),
  };
}

export function subscribeProfiles(
  userId: string,
  onData: (profiles: Profile[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const db = getFirestoreDb();
  const profilesQuery = query(
    collection(db, "profiles"),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc"),
  );

  return onSnapshot(
    profilesQuery,
    (snapshot) => {
      onData(
        snapshot.docs.map((item) =>
          mapProfile(item.id, item.data() as Record<string, unknown>),
        ),
      );
    },
    (error) => onError(error),
  );
}

export function subscribeProfile(
  userId: string,
  profileId: string,
  onData: (profile: Profile | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const db = getFirestoreDb();
  const ref = doc(db, "profiles", profileId);

  return onSnapshot(
    ref,
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null);
        return;
      }

      const profile = mapProfile(
        snapshot.id,
        snapshot.data() as Record<string, unknown>,
      );
      onData(profile.userId === userId ? profile : null);
    },
    (error) => onError(error),
  );
}

export function subscribeProfilePhotos(
  userId: string,
  profileId: string,
  onData: (photos: ProfilePhoto[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const db = getFirestoreDb();
  const photosQuery = query(
    collection(db, "profilePhotos"),
    where("userId", "==", userId),
    where("profileId", "==", profileId),
    orderBy("uploadedAt", "desc"),
  );

  return onSnapshot(
    photosQuery,
    (snapshot) => {
      onData(
        snapshot.docs.map((item) =>
          mapProfilePhoto(item.id, item.data() as Record<string, unknown>),
        ),
      );
    },
    (error) => onError(error),
  );
}

export async function getProfile(userId: string, profileId: string) {
  const db = getFirestoreDb();
  const snapshot = await getDoc(doc(db, "profiles", profileId));

  if (!snapshot.exists()) {
    return null;
  }

  const profile = mapProfile(snapshot.id, snapshot.data() as Record<string, unknown>);
  return profile.userId === userId ? profile : null;
}

export async function createProfile(userId: string, input: CreateProfileInput) {
  const db = getFirestoreDb();
  const ref = doc(collection(db, "profiles"));

  await setDoc(ref, {
    id: ref.id,
    userId,
    displayName: input.displayName.trim(),
    relationshipType: input.relationshipType,
    notes: input.notes?.trim() ?? "",
    photoCount: 0,
    readinessStatus: "incomplete",
    checklistCoverage: createEmptyChecklistCoverage(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function updateProfile(
  profileId: string,
  input: UpdateProfileInput,
) {
  const db = getFirestoreDb();

  await updateDoc(doc(db, "profiles", profileId), {
    displayName: input.displayName.trim(),
    relationshipType: input.relationshipType,
    notes: input.notes?.trim() ?? "",
    updatedAt: serverTimestamp(),
  });
}

async function refreshProfileSummary(userId: string, profileId: string) {
  const db = getFirestoreDb();
  const photosSnapshot = await getDocs(
    query(
      collection(db, "profilePhotos"),
      where("userId", "==", userId),
      where("profileId", "==", profileId),
    ),
  );

  const photos = photosSnapshot.docs.map((item) =>
    mapProfilePhoto(item.id, item.data() as Record<string, unknown>),
  );
  const photoCount = photos.length;

  await updateDoc(doc(db, "profiles", profileId), {
    photoCount,
    checklistCoverage: buildChecklistCoverage(photos),
    readinessStatus: getProfileReadinessStatus(photoCount),
    updatedAt: serverTimestamp(),
  });
}

export async function uploadProfilePhotos(
  userId: string,
  profileId: string,
  files: File[],
) {
  const db = getFirestoreDb();
  const storage = getFirebaseStorage();

  for (const [index, file] of files.entries()) {
    const storagePath = `users/${userId}/profiles/${profileId}/${Date.now()}-${index}-${sanitizeFilename(file.name)}`;
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    const photoRef = doc(collection(db, "profilePhotos"));

    await setDoc(photoRef, {
      id: photoRef.id,
      userId,
      profileId,
      storagePath,
      downloadURL,
      tags: [],
      uploadedAt: serverTimestamp(),
    });
  }

  await refreshProfileSummary(userId, profileId);
}

export async function updateProfilePhotoTags(
  userId: string,
  photoId: string,
  tags: ChecklistTag[],
) {
  const db = getFirestoreDb();
  const photoRef = doc(db, "profilePhotos", photoId);
  const photoSnapshot = await getDoc(photoRef);

  if (!photoSnapshot.exists()) {
    return;
  }

  const photo = mapProfilePhoto(
    photoSnapshot.id,
    photoSnapshot.data() as Record<string, unknown>,
  );

  if (photo.userId !== userId) {
    throw new Error("You do not have access to update this photo.");
  }

  await updateDoc(photoRef, { tags });
  await refreshProfileSummary(userId, photo.profileId);
}

export async function deleteProfilePhoto(userId: string, photoId: string) {
  const db = getFirestoreDb();
  const storage = getFirebaseStorage();
  const photoRef = doc(db, "profilePhotos", photoId);
  const photoSnapshot = await getDoc(photoRef);

  if (!photoSnapshot.exists()) {
    return;
  }

  const photo = mapProfilePhoto(
    photoSnapshot.id,
    photoSnapshot.data() as Record<string, unknown>,
  );

  if (photo.userId !== userId) {
    throw new Error("You do not have access to delete this photo.");
  }

  if (photo.storagePath) {
    await deleteObject(ref(storage, photo.storagePath)).catch(() => undefined);
  }

  await deleteDoc(photoRef);
  await refreshProfileSummary(userId, photo.profileId);
}

export async function deleteProfile(userId: string, profileId: string) {
  const db = getFirestoreDb();
  const storage = getFirebaseStorage();
  const photosSnapshot = await getDocs(
    query(
      collection(db, "profilePhotos"),
      where("userId", "==", userId),
      where("profileId", "==", profileId),
    ),
  );

  for (const item of photosSnapshot.docs) {
    const photo = mapProfilePhoto(item.id, item.data() as Record<string, unknown>);
    if (photo.storagePath) {
      await deleteObject(ref(storage, photo.storagePath)).catch(() => undefined);
    }
    await deleteDoc(item.ref);
  }

  await deleteDoc(doc(db, "profiles", profileId));
}
