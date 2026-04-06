import type {
  GenerationProviderRequest,
  GenerationResultObject,
} from "./types";

export interface GenerationProvider {
  readonly providerId: string;
  generate(
    request: GenerationProviderRequest,
  ): Promise<GenerationResultObject[]>;
}
