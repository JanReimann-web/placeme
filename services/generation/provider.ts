import type {
  GeneratedImageDraft,
  GenerationProviderContext,
} from "@/types/domain";

export interface GenerationProvider {
  generate(context: GenerationProviderContext): Promise<GeneratedImageDraft[]>;
}
