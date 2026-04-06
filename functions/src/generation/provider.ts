import type {
  GenerationProviderRequest,
  ProviderGeneratedImage,
} from "./types";

export interface GenerationProvider {
  readonly providerId: string;
  generate(
    request: GenerationProviderRequest,
  ): Promise<ProviderGeneratedImage[]>;
}
