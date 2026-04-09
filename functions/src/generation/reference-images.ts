import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import * as logger from "firebase-functions/logger";
import sharp from "sharp";
import type {
  GenerationInput,
  PreparedReferenceImage,
  ProfilePhotoRecord,
} from "./types";

const PRIMARY_REFERENCE_LIMIT = 5;
const COMPANION_REFERENCE_LIMIT = 3;
const MAX_REFERENCE_EDGE = 1024;
const TAG_PRIORITY_SCORES: Record<string, number> = {
  frontPortrait: 40,
  goodLighting: 32,
  neutralExpression: 20,
  leftSide: 16,
  rightSide: 16,
  smiling: 10,
  halfBody: 8,
  fullBody: 6,
};

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asTags(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown reference image error.";
}

function buildCorruptReferenceMessage(profileName: string) {
  return `One or more uploaded reference photos for ${profileName} could not be processed. Remove and re-upload the affected photos, then try again.`;
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
      const leftGain = left.tags.reduce((score, tag) => {
        if (coveredTags.has(tag)) {
          return score;
        }

        return score + (TAG_PRIORITY_SCORES[tag] ?? 1);
      }, 0);
      const rightGain = right.tags.reduce((score, tag) => {
        if (coveredTags.has(tag)) {
          return score;
        }

        return score + (TAG_PRIORITY_SCORES[tag] ?? 1);
      }, 0);

      if (rightGain !== leftGain) {
        return rightGain - leftGain;
      }

      const leftPriority = left.tags.reduce(
        (score, tag) => score + (TAG_PRIORITY_SCORES[tag] ?? 0),
        0,
      );
      const rightPriority = right.tags.reduce(
        (score, tag) => score + (TAG_PRIORITY_SCORES[tag] ?? 0),
        0,
      );

      if (rightPriority !== leftPriority) {
        return rightPriority - leftPriority;
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

  if (!buffer.length) {
    throw new Error("Reference photo file is empty.");
  }

  return sharp(buffer, {
    failOn: "none",
  })
    .rotate()
    .resize({
      width: MAX_REFERENCE_EDGE,
      height: MAX_REFERENCE_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .flatten({
      background: "#ffffff",
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
  const candidatePhotos = selectReferencePhotos(photos, photos.length);
  const preparedImages: PreparedReferenceImage[] = [];
  let skippedCount = 0;

  for (const photo of candidatePhotos) {
    if (preparedImages.length >= limit) {
      break;
    }

    try {
      preparedImages.push({
        sourceProfileId: profileId,
        sourceProfileName: profileName,
        participantRole: role,
        storagePath: photo.storagePath,
        mimeType: "image/jpeg",
        data: await prepareImageBuffer(photo.storagePath),
      });
    } catch (error) {
      skippedCount += 1;

      logger.warn("Skipping unusable reference photo during generation.", {
        profileId,
        profileName,
        role,
        photoId: photo.id,
        storagePath: photo.storagePath,
        error: toErrorMessage(error),
      });
    }
  }

  if (!preparedImages.length && skippedCount > 0) {
    throw new Error(buildCorruptReferenceMessage(profileName));
  }

  if (skippedCount > 0) {
    logger.info("Prepared reference images with skipped invalid files.", {
      profileId,
      profileName,
      role,
      requestedLimit: limit,
      preparedCount: preparedImages.length,
      skippedCount,
    });
  }

  return preparedImages;
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
