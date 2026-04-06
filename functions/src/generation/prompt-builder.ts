import { getDestinationLabel, getStyleLabel } from "./scene-packs";
import type {
  GenerationInput,
  SceneDescriptor,
  ScenePromptDefinition,
} from "./types";

export function buildScenePromptDefinitions({
  input,
  scenes,
}: {
  input: GenerationInput;
  scenes: SceneDescriptor[];
}): ScenePromptDefinition[] {
  const participants = input.companionProfile
    ? [input.primaryProfile.displayName, input.companionProfile.displayName]
    : [input.primaryProfile.displayName];
  const participantLabel =
    participants.length > 1 ? participants.join(" and ") : participants[0];

  return scenes.map((scene) => ({
    sceneKey: scene.key,
    sceneTitle: scene.title,
    sceneDescription: scene.description,
    wardrobeHint: scene.wardrobeHint,
    destination: input.destination,
    style: input.style,
    participants,
    prompt: [
      `Create one photorealistic premium travel photo of ${participantLabel}.`,
      `Destination: ${getDestinationLabel(input.destination)}.`,
      `Scene: ${scene.title} - ${scene.description}.`,
      `Style direction: ${getStyleLabel(input.style)}.`,
      `Wardrobe guidance: ${scene.wardrobeHint}.`,
      "Identity goal: preserve facial structure, proportions, hairstyle, skin tone, and likeness across the whole set.",
      "Composition: premium editorial travel photography, natural lighting, believable candid posture, calm luxury travel mood.",
      input.companionProfile
        ? "Ensure both people remain consistent and proportionally accurate relative to each other, with no face swapping or duplicate people."
        : "Focus on a single subject with strong identity consistency and no extra people in the foreground.",
    ].join(" "),
    // TODO(Gemini): tune this negative prompt once the real provider is wired in.
    negativePrompt:
      "low quality, distorted anatomy, identity drift, extra limbs, duplicate subject, unrealistic lighting, collage, text overlay, split screen",
  }));
}
