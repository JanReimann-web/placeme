import { getDestinationLabel, getStyleLabel } from "@/lib/constants";
import type { GenerationInput, ScenePromptDefinition } from "@/types/generation";
import type { SceneDescriptor } from "@/types/domain";

function buildCompanionConsistencyInstruction(input: GenerationInput) {
  if (!input.companionProfile) {
    return "Focus on a single subject with strong identity consistency.";
  }

  if (
    input.primaryProfile.relationshipType === "pet" ||
    input.companionProfile.relationshipType === "pet"
  ) {
    return "Ensure the human and pet remain consistent and naturally proportioned relative to each other, with correct species traits and no humanized pet features.";
  }

  return "Ensure both people remain consistent and proportionally accurate relative to each other.";
}

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
      `Generate a realistic travel photo set for ${participantLabel}.`,
      `Destination: ${getDestinationLabel(input.destination)}.`,
      `Scene: ${scene.title} - ${scene.description}.`,
      `Style direction: ${getStyleLabel(input.style)}.`,
      `Wardrobe guidance: ${scene.wardrobeHint}.`,
      `Identity goal: preserve the subject's facial structure, proportions, and likeness across the whole set.`,
      `Composition: premium editorial travel photography, natural lighting, believable candid posture.`,
      buildCompanionConsistencyInstruction(input),
    ].join(" "),
    // TODO(Gemini): tune this negative prompt once the real provider is wired in.
    negativePrompt:
      "low quality, distorted anatomy, identity drift, extra limbs, duplicate subject, unrealistic lighting",
  }));
}
