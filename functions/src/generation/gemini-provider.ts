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
    "The first primary reference is the strongest identity anchor. If any references conflict, prioritize that first primary reference for face identity and likeness.",
    "Use the attached reference images to preserve exact identity, not approximate similarity. Match the real person's facial proportions, age impression, hairline, and silhouette.",
    "Do not beautify, de-age, smooth skin, enlarge eyes, slim the nose, sharpen the jaw, or otherwise idealize the subject.",
    "Keep any scene realism or styling choices secondary to identity fidelity.",
    "Keep the result photorealistic, premium, calm, and believable. Avoid collage, split-screen, diptych, text overlays, logos, and watermarks other than any built-in provider marking.",
    `Avoid: ${negativePrompt}.`,
  ].join(" ");
}

function describeReferenceImage(reference: PreparedReferenceImage, index: number) {
  const participantLabel =
    reference.participantRole === "primary" ? "primary traveler" : "companion";
  const tagLabel = reference.tags.length
    ? ` Tags: ${reference.tags.join(", ")}.`
    : "";

  switch (reference.referenceKind) {
    case "identity-anchor":
      return `Reference ${index + 1}: ${participantLabel} identity anchor. Treat this as the strongest source for face identity, age impression, hairline, forehead, eyes, nose, jawline, and overall likeness.${tagLabel}`;
    case "angle-support":
      return `Reference ${index + 1}: ${participantLabel} angle support. Use this to confirm side profile, nose projection, jawline, ear placement, and facial structure from another angle.${tagLabel}`;
    case "body-support":
      return `Reference ${index + 1}: ${participantLabel} body support. Use this to confirm body build, shoulder width, posture, limb proportions, and hand scale.${tagLabel}`;
    case "expression-support":
      return `Reference ${index + 1}: ${participantLabel} expression support. Use this to confirm natural expression range without changing identity.${tagLabel}`;
    default:
      return `Reference ${index + 1}: ${participantLabel} general support. Use this only to reinforce identity consistency with the stronger anchor references.${tagLabel}`;
  }
}

function buildReferenceContents(references: PreparedReferenceImage[]) {
  return [...references]
    .sort((left, right) => {
      if (left.participantRole !== right.participantRole) {
        return left.participantRole === "primary" ? -1 : 1;
      }

      return left.referenceOrder - right.referenceOrder;
    })
    .flatMap((image, index) => [
      {
        text: describeReferenceImage(image, index),
      },
      {
        inlineData: {
          mimeType: image.mimeType,
          data: image.data.toString("base64"),
        },
      },
    ]);
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
        ...buildReferenceContents(request.referenceImages),
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
