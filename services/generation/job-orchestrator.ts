import { getSceneSelection } from "@/lib/constants";
import { MockGenerationProvider } from "@/services/generation/mock-provider";
import { buildScenePromptDefinitions } from "@/services/generation/prompt-builder";
import type { GenerationInput, GenerationRunResult } from "@/types/generation";

const provider = new MockGenerationProvider();

export async function processGenerationJob(
  input: GenerationInput,
): Promise<GenerationRunResult> {
  const scenes = getSceneSelection(input.destination, input.imageCount);
  const scenePrompts = buildScenePromptDefinitions({ input, scenes });

  const images = await provider.generate({
    input,
    scenes,
    scenePrompts,
  });

  return {
    jobId: input.jobId,
    providerId: provider.providerId,
    status: "completed",
    sceneCount: images.length,
    images,
    errorMessage: null,
  };
}
