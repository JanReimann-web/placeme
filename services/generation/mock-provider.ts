import { createMockImageUrl } from "@/lib/mock-images";
import { sleep } from "@/lib/utils";
import type {
  GenerationProviderRequest,
  GenerationResultObject,
} from "@/types/generation";
import type { GenerationProvider } from "@/services/generation/provider";

export class MockGenerationProvider implements GenerationProvider {
  readonly providerId = "mock-generation-provider";

  async generate(
    request: GenerationProviderRequest,
  ): Promise<GenerationResultObject[]> {
    const participants = request.input.companionProfile
      ? [
          request.input.primaryProfile.displayName,
          request.input.companionProfile.displayName,
        ]
      : [request.input.primaryProfile.displayName];

    await sleep(1200);

    // TODO(Gemini): replace mock SVG generation with real server-side Gemini image generation.
    return request.scenes.map((scene, index) => ({
      sceneKey: scene.key,
      imageURL: createMockImageUrl({
        destination: request.input.destination,
        style: request.input.style,
        scene,
        participants,
        index,
      }),
      storagePath: `mock/users/${request.input.userId}/generated/${request.input.jobId}/${scene.key}.svg`,
      prompt: request.scenePrompts[index]?.prompt ?? scene.description,
      providerAssetId: null,
      providerMetadata: {
        provider: this.providerId,
        mock: true,
        destination: request.input.destination,
        style: request.input.style,
      },
    }));
  }
}
