import { PROFILE_CHECKLIST_ITEMS } from "@/lib/constants";
import type {
  ChecklistTag,
  Profile,
  ProfileChecklistCoverage,
  ProfilePhoto,
  ReadinessStatus,
} from "@/types/domain";

export function createEmptyChecklistCoverage(): ProfileChecklistCoverage {
  return {
    frontPortrait: false,
    leftSide: false,
    rightSide: false,
    halfBody: false,
    fullBody: false,
    neutralExpression: false,
    smiling: false,
    goodLighting: false,
  };
}

export function isChecklistTag(value: string): value is ChecklistTag {
  return PROFILE_CHECKLIST_ITEMS.some((item) => item.key === value);
}

export function buildChecklistCoverage(photos: Pick<ProfilePhoto, "tags">[]) {
  const coverage = createEmptyChecklistCoverage();

  for (const photo of photos) {
    for (const tag of photo.tags) {
      if (isChecklistTag(tag)) {
        coverage[tag] = true;
      }
    }
  }

  return coverage;
}

export function getProfileReadinessStatus(photoCount: number): ReadinessStatus {
  return photoCount >= 8 ? "ready" : "incomplete";
}

export function getReadinessSummary(
  profile: Pick<Profile, "photoCount" | "checklistCoverage" | "readinessStatus">,
) {
  const minimumPhotoTarget = 8;
  const coveredItems = PROFILE_CHECKLIST_ITEMS.filter(
    (item) => profile.checklistCoverage[item.key],
  ).length;
  const missingItems = PROFILE_CHECKLIST_ITEMS.filter(
    (item) => !profile.checklistCoverage[item.key],
  );
  const coveragePercent = Math.round(
    (coveredItems / PROFILE_CHECKLIST_ITEMS.length) * 100,
  );
  const remainingPhotos = Math.max(0, minimumPhotoTarget - profile.photoCount);
  const photoProgressPercent = Math.min(
    100,
    Math.round((profile.photoCount / minimumPhotoTarget) * 100),
  );

  return {
    coveredItems,
    totalItems: PROFILE_CHECKLIST_ITEMS.length,
    coveragePercent,
    photoProgressPercent,
    remainingPhotos,
    missingItems,
    minimumPhotoTarget,
    statusLabel:
      profile.readinessStatus === "ready" ? "Ready to generate" : "Still building",
    nextAction:
      profile.readinessStatus === "ready"
        ? missingItems.length
          ? `Generation is unlocked. Add a few missing checklist angles to reduce identity drift across scenes.`
          : "This profile has strong manual coverage across angles, framing, and expression."
        : `Upload ${remainingPhotos} more ${remainingPhotos === 1 ? "photo" : "photos"} to unlock generation.`,
    message:
      profile.readinessStatus === "ready"
        ? "Ready to test identity consistency across a controlled travel scene pack."
        : `Add ${remainingPhotos} more ${remainingPhotos === 1 ? "photo" : "photos"} to unlock generation.`,
  };
}
