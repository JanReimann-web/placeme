import type {
  GenerationProviderRequest,
  GenerationResultObject,
} from "@/types/generation";

export interface GenerationProvider {
  readonly providerId: string;
  generate(request: GenerationProviderRequest): Promise<GenerationResultObject[]>;
}
