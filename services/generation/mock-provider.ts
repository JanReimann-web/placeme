import { createMockImageUrl } from "@/lib/mock-images";
import { sleep } from "@/lib/utils";
import { getScenePrompts } from "@/services/generation/prompt-builder";
import type {
  GeneratedImageDraft,
  GenerationProviderContext,
} from "@/types/domain";
import type { GenerationProvider } from "@/services/generation/provider";

export class MockGenerationProvider implements GenerationProvider {
  async generate(
    context: GenerationProviderContext,
  ): Promise<GeneratedImageDraft[]> {
    const prompts = getScenePrompts(context);
    const participants = context.companionProfile
      ? [
          context.primaryProfile.displayName,
          context.companionProfile.displayName,
        ]
      : [context.primaryProfile.displayName];

    await sleep(1200);

    return context.scenes.map((scene, index) => ({
      sceneKey: scene.key,
      imageURL: createMockImageUrl({
        destination: context.destination,
        style: context.style,
        scene,
        participants,
        index,
      }),
      storagePath: `mock/users/${context.userId}/generated/${context.jobId}/${scene.key}.svg`,
      prompt: prompts[index]?.prompt ?? scene.description,
    }));
  }
}
