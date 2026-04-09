export type RelationshipType =
  | "self"
  | "partner"
  | "child"
  | "parent"
  | "friend"
  | "pet"
  | "other";

export type ReadinessStatus = "incomplete" | "ready";
export type GenerationMode = "solo" | "companion";
export type GenerationJobStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export type DestinationKey = "new-york" | "paris" | "tokyo" | "dubai";
export type TravelStyleKey =
  | "casual-travel"
  | "premium-elegant"
  | "romantic"
  | "family-travel";

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

export interface ProfileRecord {
  id: string;
  userId: string;
  displayName: string;
  relationshipType: RelationshipType;
  notes: string;
  photoCount: number;
  readinessStatus: ReadinessStatus;
  checklistCoverage: ProfileChecklistCoverage;
}

export interface ProfilePhotoRecord {
  id: string;
  userId: string;
  profileId: string;
  storagePath: string;
  downloadURL: string;
  tags: string[];
  uploadedAt: string;
}

export interface GenerationJobRecord {
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
  errorMessage: string | null;
}

export interface SceneDescriptor {
  key: string;
  title: string;
  description: string;
  wardrobeHint: string;
}

export interface GenerationInput {
  jobId: string;
  userId: string;
  mode: GenerationMode;
  destination: DestinationKey;
  style: TravelStyleKey;
  imageCount: 8 | 10 | 12;
  scenePackId: string;
  primaryProfile: ProfileRecord;
  companionProfile?: ProfileRecord | null;
  primaryReferencePhotos: ProfilePhotoRecord[];
  companionReferencePhotos: ProfilePhotoRecord[];
}

export interface ScenePromptDefinition {
  sceneKey: string;
  sceneTitle: string;
  sceneDescription: string;
  wardrobeHint: string;
  prompt: string;
  negativePrompt: string;
  destination: DestinationKey;
  style: TravelStyleKey;
  participants: string[];
}

export interface GenerationProviderRequest {
  input: GenerationInput;
  scenes: SceneDescriptor[];
  scenePrompts: ScenePromptDefinition[];
  referenceImages: PreparedReferenceImage[];
}

export interface PreparedReferenceImage {
  sourceProfileId: string;
  sourceProfileName: string;
  participantRole: "primary" | "companion";
  referenceKind:
    | "identity-anchor"
    | "angle-support"
    | "body-support"
    | "expression-support"
    | "general-support";
  tags: string[];
  referenceOrder: number;
  storagePath: string;
  mimeType: string;
  data: Buffer;
}

export interface ProviderGeneratedImage {
  sceneKey: string;
  prompt: string;
  mimeType: string;
  fileExtension: string;
  imageData: Buffer;
  providerAssetId: string | null;
  providerMetadata: Record<string, string | number | boolean | null>;
}

export interface GenerationResultObject {
  sceneKey: string;
  imageURL: string;
  storagePath: string;
  prompt: string;
  providerAssetId: string | null;
  providerMetadata: Record<string, string | number | boolean | null>;
}

export interface GenerationRunResult {
  jobId: string;
  providerId: string;
  status: Extract<GenerationJobStatus, "completed" | "failed">;
  sceneCount: number;
  images: GenerationResultObject[];
  errorMessage: string | null;
}
