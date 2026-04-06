import { createMockImageUrl } from "./mock-image";
import type { GenerationProvider } from "./provider";
import type {
  GenerationProviderRequest,
  GenerationResultObject,
} from "./types";

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });
}

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

    await sleep(900);

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
