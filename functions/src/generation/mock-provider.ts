import { createMockImageBuffer } from "./mock-image";
import type { GenerationProvider } from "./provider";
import type {
  GenerationProviderRequest,
  ProviderGeneratedImage,
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
  ): Promise<ProviderGeneratedImage[]> {
    const participants = request.input.companionProfile
      ? [
          request.input.primaryProfile.displayName,
          request.input.companionProfile.displayName,
        ]
      : [request.input.primaryProfile.displayName];

    await sleep(900);

    // TODO(Gemini): remove this fallback provider once the Gemini path is fully validated in production.
    return request.scenes.map((scene, index) => ({
      sceneKey: scene.key,
      imageData: createMockImageBuffer({
        destination: request.input.destination,
        style: request.input.style,
        scene,
        participants,
        index,
      }),
      mimeType: "image/svg+xml",
      fileExtension: "svg",
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
