import type {
  DestinationKey,
  GenerationJobStatus,
  GenerationMode,
  Profile,
  SceneDescriptor,
  TravelStyleKey,
} from "@/types/domain";

export interface GenerationInput {
  jobId: string;
  userId: string;
  mode: GenerationMode;
  destination: DestinationKey;
  style: TravelStyleKey;
  imageCount: 8 | 10 | 12;
  scenePackId: string;
  primaryProfile: Profile;
  companionProfile?: Profile | null;
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

export interface JobStatusUpdate {
  jobId: string;
  userId: string;
  status: GenerationJobStatus;
  errorMessage: string | null;
  providerId?: string | null;
  processedSceneCount?: number;
}
