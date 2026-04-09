import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import * as logger from "firebase-functions/logger";
import sharp from "sharp";
import type {
  GenerationInput,
  PreparedReferenceImage,
  ProfilePhotoRecord,
  RelationshipType,
} from "./types";

const PRIMARY_REFERENCE_LIMIT = 4;
const COMPANION_REFERENCE_LIMIT = 2;
const MAX_REFERENCE_EDGE = 1280;
const REFERENCE_JPEG_QUALITY = 90;
const HUMAN_TAG_PRIORITY_SCORES: Record<string, number> = {
  frontPortrait: 40,
  goodLighting: 32,
  neutralExpression: 20,
  leftSide: 16,
  rightSide: 16,
  smiling: 10,
  halfBody: 8,
  fullBody: 6,
};
const PET_TAG_PRIORITY_SCORES: Record<string, number> = {
  frontPortrait: 40,
  coatPattern: 34,
  goodLighting: 30,
  leftSide: 18,
  rightSide: 18,
  fullBody: 16,
  standingPose: 14,
  sittingPose: 12,
};
const HUMAN_REFERENCE_SELECTION_STEPS = [
  {
    kind: "identity-anchor" as const,
    preferredTags: ["frontPortrait", "goodLighting", "neutralExpression"],
  },
  {
    kind: "angle-support" as const,
    preferredTags: ["leftSide", "rightSide", "goodLighting"],
  },
  {
    kind: "body-support" as const,
    preferredTags: ["halfBody", "fullBody", "goodLighting"],
  },
  {
    kind: "expression-support" as const,
    preferredTags: ["smiling", "frontPortrait", "goodLighting"],
  },
];
const PET_REFERENCE_SELECTION_STEPS = [
  {
    kind: "identity-anchor" as const,
    preferredTags: ["frontPortrait", "coatPattern", "goodLighting"],
  },
  {
    kind: "angle-support" as const,
    preferredTags: ["leftSide", "rightSide", "frontPortrait"],
  },
  {
    kind: "body-support" as const,
    preferredTags: ["fullBody", "standingPose", "goodLighting"],
  },
  {
    kind: "general-support" as const,
    preferredTags: ["sittingPose", "coatPattern", "goodLighting"],
  },
];

function getReferenceSelectionConfig(relationshipType: RelationshipType) {
  if (relationshipType === "pet") {
    return {
      tagPriorityScores: PET_TAG_PRIORITY_SCORES,
      selectionSteps: PET_REFERENCE_SELECTION_STEPS,
    };
  }

  return {
    tagPriorityScores: HUMAN_TAG_PRIORITY_SCORES,
    selectionSteps: HUMAN_REFERENCE_SELECTION_STEPS,
  };
}

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

function getReferenceScore(
  photo: ProfilePhotoRecord,
  {
    preferredTags,
    coveredTags,
    tagPriorityScores,
  }: {
    preferredTags: string[];
    coveredTags: Set<string>;
    tagPriorityScores: Record<string, number>;
  },
) {
  return photo.tags.reduce((score, tag) => {
    const tagPriority = tagPriorityScores[tag] ?? 1;
    const preferredWeight = preferredTags.includes(tag) ? 4 : 1;
    const noveltyWeight = coveredTags.has(tag) ? 0.35 : 1;

    return score + tagPriority * preferredWeight * noveltyWeight;
  }, 0);
}

function selectBestPhoto({
  remaining,
  coveredTags,
  preferredTags,
  tagPriorityScores,
}: {
  remaining: ProfilePhotoRecord[];
  coveredTags: Set<string>;
  preferredTags: string[];
  tagPriorityScores: Record<string, number>;
}) {
  const sorted = [...remaining].sort((left, right) => {
    const leftScore = getReferenceScore(left, {
      preferredTags,
      coveredTags,
      tagPriorityScores,
    });
    const rightScore = getReferenceScore(right, {
      preferredTags,
      coveredTags,
      tagPriorityScores,
    });

    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    const leftPriority = left.tags.reduce(
      (score, tag) => score + (tagPriorityScores[tag] ?? 0),
      0,
    );
    const rightPriority = right.tags.reduce(
      (score, tag) => score + (tagPriorityScores[tag] ?? 0),
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

  return sorted[0] ?? null;
}

function selectReferencePhotos(
  photos: ProfilePhotoRecord[],
  limit: number,
  relationshipType: RelationshipType,
) {
  const { selectionSteps, tagPriorityScores } =
    getReferenceSelectionConfig(relationshipType);
  const remaining = [...photos];
  const selected: Array<{
    photo: ProfilePhotoRecord;
    kind:
      | "identity-anchor"
      | "angle-support"
      | "body-support"
      | "expression-support"
      | "general-support";
  }> = [];
  const coveredTags = new Set<string>();

  for (const step of selectionSteps) {
    if (selected.length >= limit || !remaining.length) {
      break;
    }

    const next = selectBestPhoto({
      remaining,
      coveredTags,
      preferredTags: step.preferredTags,
      tagPriorityScores,
    });

    if (!next) {
      continue;
    }

    selected.push({
      photo: next,
      kind: step.kind,
    });
    remaining.splice(remaining.indexOf(next), 1);

    for (const tag of next.tags) {
      coveredTags.add(tag);
    }
  }

  while (selected.length < limit && remaining.length) {
    const next = selectBestPhoto({
      remaining,
      coveredTags,
      preferredTags: [],
      tagPriorityScores,
    });

    if (!next) {
      break;
    }

    selected.push({
      photo: next,
      kind: "general-support",
    });
    remaining.splice(remaining.indexOf(next), 1);

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
      quality: REFERENCE_JPEG_QUALITY,
      mozjpeg: true,
    })
    .toBuffer();
}

async function prepareProfileImages({
  profileId,
  profileName,
  relationshipType,
  role,
  photos,
  limit,
}: {
  profileId: string;
  profileName: string;
  relationshipType: RelationshipType;
  role: "primary" | "companion";
  photos: ProfilePhotoRecord[];
  limit: number;
}): Promise<PreparedReferenceImage[]> {
  const candidatePhotos = selectReferencePhotos(
    photos,
    photos.length,
    relationshipType,
  );
  const preparedImages: PreparedReferenceImage[] = [];
  let skippedCount = 0;

  for (const [index, candidate] of candidatePhotos.entries()) {
    if (preparedImages.length >= limit) {
      break;
    }

    try {
      preparedImages.push({
        sourceProfileId: profileId,
        sourceProfileName: profileName,
        participantRole: role,
        referenceKind: candidate.kind,
        tags: candidate.photo.tags,
        referenceOrder: index,
        storagePath: candidate.photo.storagePath,
        mimeType: "image/jpeg",
        data: await prepareImageBuffer(candidate.photo.storagePath),
      });
    } catch (error) {
      skippedCount += 1;

      logger.warn("Skipping unusable reference photo during generation.", {
        profileId,
        profileName,
        role,
        photoId: candidate.photo.id,
        storagePath: candidate.photo.storagePath,
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
    relationshipType: input.primaryProfile.relationshipType,
    role: "primary",
    photos: input.primaryReferencePhotos,
    limit: PRIMARY_REFERENCE_LIMIT,
  });

  const companionImages = input.companionProfile
      ? await prepareProfileImages({
        profileId: input.companionProfile.id,
        profileName: input.companionProfile.displayName,
        relationshipType: input.companionProfile.relationshipType,
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
