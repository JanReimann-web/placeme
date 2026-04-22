import { getDestinationLabel, getStyleLabel } from "@/lib/constants";
import type { GenerationInput, ScenePromptDefinition } from "@/types/generation";
import type { SceneDescriptor } from "@/types/domain";

function getPetIdentityGuidance(input: GenerationInput) {
  const petProfiles = [
    input.primaryProfile,
    input.companionProfile ?? null,
  ].filter((profile) => profile?.relationshipType === "pet");

  if (!petProfiles.length) {
    return null;
  }

  const names = petProfiles.map((profile) => profile?.displayName).join(", ");

  return [
    `Pet fidelity: ${names} must match the reference photos as closely as possible.`,
    "Preserve head shape, muzzle, ears, eye color, fur color, fur markings, body proportions, tail, paws, and posture.",
    "Keep the neck area anatomically natural and visible when the scene allows it; preserve any collar, harness, tag, bow, leash attachment, or distinctive neck/fur pattern from the references.",
    "Do not humanize the pet, change breed, add fantasy anatomy, hide the neck with random accessories, or duplicate the pet.",
  ].join(" ");
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
  const customTravelRequest = input.customTravelRequest?.trim();
  const petIdentityGuidance = getPetIdentityGuidance(input);

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
      input.destination === "custom"
        ? "Destination or event: follow the custom user brief as the primary source of truth."
        : `Destination: ${getDestinationLabel(input.destination)}.`,
      customTravelRequest
        ? `Custom user brief: ${customTravelRequest}. Interpret this literally unless it conflicts with identity consistency or realism.`
        : null,
      `Scene: ${scene.title} - ${scene.description}.`,
      `Style direction: ${getStyleLabel(input.style)}.`,
      `Wardrobe guidance: ${scene.wardrobeHint}.`,
      `Identity goal: preserve the subject's facial structure, proportions, hairstyle, skin tone, and likeness across the whole set. Match the reference photos as closely as possible.`,
      petIdentityGuidance,
      `Composition: premium editorial travel photography, natural lighting, believable candid posture.`,
      input.companionProfile
        ? "Ensure all participants remain consistent and proportionally accurate relative to each other, with no face swapping or duplicate subjects."
        : "Focus on a single subject with strong identity consistency.",
    ].filter(Boolean).join(" "),
    // TODO(Gemini): tune this negative prompt once the real provider is wired in.
    negativePrompt:
      "low quality, distorted anatomy, identity drift, extra limbs, duplicate subject, unrealistic lighting, wrong breed, changed collar, hidden pet neck, extra pet, text overlay",
  }));
}
