import { GoogleGenAI } from "@google/genai";
import type { GenerationProvider } from "./provider";
import type {
  GenerationProviderRequest,
  PreparedReferenceImage,
  ProviderGeneratedImage,
} from "./types";

const GEMINI_IMAGE_MODEL = "gemini-3.1-flash-image-preview";
const OUTPUT_ASPECT_RATIO = "4:5";
const SEARCH_GROUNDING_TOOL = {
  googleSearch: {
    searchTypes: {
      webSearch: {},
      imageSearch: {},
    },
  },
};

function toFileExtension(mimeType: string) {
  if (mimeType.includes("png")) {
    return "png";
  }

  if (mimeType.includes("webp")) {
    return "webp";
  }

  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) {
    return "jpg";
  }

  return "png";
}

function buildProviderPrompt({
  basePrompt,
  references,
  negativePrompt,
}: {
  basePrompt: string;
  references: PreparedReferenceImage[];
  negativePrompt: string;
}) {
  const primaryCount = references.filter(
    (item) => item.participantRole === "primary",
  ).length;
  const companionCount = references.filter(
    (item) => item.participantRole === "companion",
  ).length;

  return [
    basePrompt,
    `Reference guidance: ${primaryCount} reference image(s) are attached for the primary traveler${companionCount ? ` and ${companionCount} for the companion` : ""}.`,
    "Use the attached reference images to preserve identity, face shape, age, hair, and overall likeness.",
    "Keep the result photorealistic, premium, calm, and believable. Avoid collage, split-screen, diptych, text overlays, logos, and watermarks other than any built-in provider marking.",
    `Avoid: ${negativePrompt}.`,
  ].join(" ");
}

export class GeminiGenerationProvider implements GenerationProvider {
  readonly providerId = GEMINI_IMAGE_MODEL;

  private readonly client: GoogleGenAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
  }

  async generate(
    request: GenerationProviderRequest,
  ): Promise<ProviderGeneratedImage[]> {
    const results: ProviderGeneratedImage[] = [];

    for (const scenePrompt of request.scenePrompts) {
      const contents = [
        {
          text: buildProviderPrompt({
            basePrompt: scenePrompt.prompt,
            references: request.referenceImages,
            negativePrompt: scenePrompt.negativePrompt,
          }),
        },
        ...request.referenceImages.map((image) => ({
          inlineData: {
            mimeType: image.mimeType,
            data: image.data.toString("base64"),
          },
        })),
      ];

      const response = await this.client.models.generateContent({
        model: GEMINI_IMAGE_MODEL,
        contents,
        config: {
          responseModalities: ["IMAGE"],
          imageConfig: {
            aspectRatio: OUTPUT_ASPECT_RATIO,
          },
          tools: [SEARCH_GROUNDING_TOOL],
        },
      });

      const parts = (
        response.candidates?.[0]?.content?.parts ??
        ("parts" in response
          ? (response.parts as Array<{
              inlineData?: { data?: string; mimeType?: string };
            }>)
          : [])
      ) as Array<{
        inlineData?: { data?: string; mimeType?: string };
      }>;
      const inlineImage = parts.find((part) => part.inlineData?.data);

      if (!inlineImage?.inlineData?.data) {
        throw new Error(
          `Gemini did not return image data for scene ${scenePrompt.sceneKey}.`,
        );
      }

      const mimeType = inlineImage.inlineData.mimeType ?? "image/png";

      results.push({
        sceneKey: scenePrompt.sceneKey,
        prompt: scenePrompt.prompt,
        mimeType,
        fileExtension: toFileExtension(mimeType),
        imageData: Buffer.from(inlineImage.inlineData.data, "base64"),
        providerAssetId: null,
        providerMetadata: {
          model: GEMINI_IMAGE_MODEL,
          aspectRatio: OUTPUT_ASPECT_RATIO,
          referenceImageCount: request.referenceImages.length,
        },
      });
    }

    return results;
  }
}
