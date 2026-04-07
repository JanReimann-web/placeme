export type RelationshipType =
  | "self"
  | "partner"
  | "child"
  | "parent"
  | "friend"
  | "other";

export type ReadinessStatus = "incomplete" | "ready";
export type GenerationMode = "solo" | "companion";
export type GenerationJobStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";
export type AppNotificationStatus = "unread" | "read";
export type AppNotificationKind =
  | "generation-complete"
  | "generation-failed";

export type DestinationKey = "new-york" | "paris" | "tokyo" | "dubai";
export type TravelStyleKey =
  | "casual-travel"
  | "premium-elegant"
  | "romantic"
  | "family-travel";

export type ChecklistTag =
  | "frontPortrait"
  | "leftSide"
  | "rightSide"
  | "halfBody"
  | "fullBody"
  | "neutralExpression"
  | "smiling"
  | "goodLighting";

export interface ProfileChecklistCoverage {
  frontPortrait: boolean;
  leftSide: boolean;
  rightSide: boolean;
  halfBody: boolean;
  fullBody: boolean;
  neutralExpression: boolean;
  smiling: boolean;
  goodLighting: boolean;
}

export interface AppUserRecord {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  displayName: string;
  relationshipType: RelationshipType;
  notes: string;
  photoCount: number;
  readinessStatus: ReadinessStatus;
  checklistCoverage: ProfileChecklistCoverage;
  createdAt: string;
  updatedAt: string;
}

export interface ProfilePhoto {
  id: string;
  userId: string;
  profileId: string;
  storagePath: string;
  downloadURL: string;
  tags: ChecklistTag[];
  uploadedAt: string;
}

export interface GenerationJob {
  id: string;
  userId: string;
  primaryProfileId: string;
  primaryProfileName: string;
  mode: GenerationMode;
  companionProfileId: string | null;
  companionProfileName: string | null;
  destination: DestinationKey;
  style: TravelStyleKey;
  imageCount: 8 | 10 | 12;
  status: GenerationJobStatus;
  scenePackId: string;
  createdAt: string;
  updatedAt: string;
  errorMessage: string | null;
  providerId?: string | null;
  processedSceneCount?: number | null;
}

export interface GeneratedImage {
  id: string;
  userId: string;
  jobId: string;
  sceneKey: string;
  imageURL: string;
  storagePath: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  kind: AppNotificationKind;
  title: string;
  body: string;
  href: string | null;
  jobId: string | null;
  status: AppNotificationStatus;
  createdAt: string;
  readAt: string | null;
}

export interface DestinationOption {
  value: DestinationKey;
  label: string;
  description: string;
}

export interface TravelStyleOption {
  value: TravelStyleKey;
  label: string;
  description: string;
}

export interface SceneDescriptor {
  key: string;
  title: string;
  description: string;
  wardrobeHint: string;
}

export interface ScenePack {
  id: string;
  destination: DestinationKey;
  scenes: SceneDescriptor[];
}

export interface CreateProfileInput {
  displayName: string;
  relationshipType: RelationshipType;
  notes?: string;
}

export interface UpdateProfileInput {
  displayName: string;
  relationshipType: RelationshipType;
  notes?: string;
}

export interface CreateGenerationJobInput {
  primaryProfileId: string;
  primaryProfileName: string;
  mode: GenerationMode;
  companionProfileId: string | null;
  companionProfileName: string | null;
  destination: DestinationKey;
  style: TravelStyleKey;
  imageCount: 8 | 10 | 12;
}

export interface ScenePrompt {
  sceneKey: string;
  sceneTitle: string;
  prompt: string;
}

export interface GenerationPromptContext {
  destination: DestinationKey;
  style: TravelStyleKey;
  primaryProfile: Profile;
  companionProfile?: Profile | null;
  scenes: SceneDescriptor[];
}

export interface GeneratedImageDraft {
  sceneKey: string;
  imageURL: string;
  storagePath: string;
  prompt: string;
}

export interface GenerationProviderContext extends GenerationPromptContext {
  jobId: string;
  userId: string;
}
