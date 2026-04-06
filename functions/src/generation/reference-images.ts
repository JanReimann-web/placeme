import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import sharp from "sharp";
import type {
  GenerationInput,
  PreparedReferenceImage,
  ProfilePhotoRecord,
} from "./types";

const PRIMARY_REFERENCE_LIMIT = 5;
const COMPANION_REFERENCE_LIMIT = 3;
const MAX_REFERENCE_EDGE = 1024;

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asTags(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function mapProfilePhotoRecord(
  id: string,
  data: Record<string, unknown>,
): ProfilePhotoRecord {
  return {
    id,
    userId: asString(data.userId),
    profileId: asString(data.profileId),
    storagePath: asString(data.storagePath),
    downloadURL: asString(data.downloadURL),
    tags: asTags(data.tags),
    uploadedAt: asString(data.uploadedAt),
  };
}

export async function listProfilePhotoRecords(
  userId: string,
  profileId: string,
): Promise<ProfilePhotoRecord[]> {
  const db = getFirestore();
  const snapshot = await db
    .collection("profilePhotos")
    .where("userId", "==", userId)
    .where("profileId", "==", profileId)
    .orderBy("uploadedAt", "desc")
    .get();

  return snapshot.docs.map((item) =>
    mapProfilePhotoRecord(item.id, item.data() as Record<string, unknown>),
  );
}

function selectReferencePhotos(photos: ProfilePhotoRecord[], limit: number) {
  const remaining = [...photos];
  const selected: ProfilePhotoRecord[] = [];
  const coveredTags = new Set<string>();

  while (selected.length < limit && remaining.length) {
    remaining.sort((left, right) => {
      const leftGain = left.tags.filter((tag) => !coveredTags.has(tag)).length;
      const rightGain = right.tags.filter((tag) => !coveredTags.has(tag)).length;

      if (rightGain !== leftGain) {
        return rightGain - leftGain;
      }

      if (right.tags.length !== left.tags.length) {
        return right.tags.length - left.tags.length;
      }

      return 0;
    });

    const next = remaining.shift();

    if (!next) {
      break;
    }

    selected.push(next);
    for (const tag of next.tags) {
      coveredTags.add(tag);
    }
  }

  return selected;
}

async function prepareImageBuffer(storagePath: string) {
  const bucket = getStorage().bucket();
  const file = bucket.file(storagePath);
  const [buffer] = await file.download();

  return sharp(buffer)
    .rotate()
    .resize({
      width: MAX_REFERENCE_EDGE,
      height: MAX_REFERENCE_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 84,
      mozjpeg: true,
    })
    .toBuffer();
}

async function prepareProfileImages({
  profileId,
  profileName,
  role,
  photos,
  limit,
}: {
  profileId: string;
  profileName: string;
  role: "primary" | "companion";
  photos: ProfilePhotoRecord[];
  limit: number;
}): Promise<PreparedReferenceImage[]> {
  const selectedPhotos = selectReferencePhotos(photos, limit);

  return Promise.all(
    selectedPhotos.map(async (photo) => ({
      sourceProfileId: profileId,
      sourceProfileName: profileName,
      participantRole: role,
      storagePath: photo.storagePath,
      mimeType: "image/jpeg",
      data: await prepareImageBuffer(photo.storagePath),
    })),
  );
}

export async function prepareReferenceImages(
  input: GenerationInput,
): Promise<PreparedReferenceImage[]> {
  const primaryImages = await prepareProfileImages({
    profileId: input.primaryProfile.id,
    profileName: input.primaryProfile.displayName,
    role: "primary",
    photos: input.primaryReferencePhotos,
    limit: PRIMARY_REFERENCE_LIMIT,
  });

  const companionImages = input.companionProfile
    ? await prepareProfileImages({
        profileId: input.companionProfile.id,
        profileName: input.companionProfile.displayName,
        role: "companion",
        photos: input.companionReferencePhotos,
        limit: COMPANION_REFERENCE_LIMIT,
      })
    : [];

  if (!primaryImages.length) {
    throw new Error("Primary profile does not have usable reference photos.");
  }

  if (input.mode === "companion" && input.companionProfile && !companionImages.length) {
    throw new Error("Companion profile does not have usable reference photos.");
  }

  return [...primaryImages, ...companionImages];
}
