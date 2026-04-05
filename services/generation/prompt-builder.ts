import { getDestinationLabel, getStyleLabel } from "@/lib/constants";
import type {
  GenerationPromptContext,
  ScenePrompt,
} from "@/types/domain";

export function getScenePrompts({
  destination,
  style,
  primaryProfile,
  companionProfile,
  scenes,
}: GenerationPromptContext): ScenePrompt[] {
  const participants = companionProfile
    ? `${primaryProfile.displayName} and ${companionProfile.displayName}`
    : primaryProfile.displayName;

  return scenes.map((scene) => ({
    sceneKey: scene.key,
    sceneTitle: scene.title,
    prompt: [
      `Generate a realistic travel photo set for ${participants}.`,
      `Destination: ${getDestinationLabel(destination)}.`,
      `Scene: ${scene.title} - ${scene.description}.`,
      `Style direction: ${getStyleLabel(style)}.`,
      `Wardrobe guidance: ${scene.wardrobeHint}.`,
      `Identity goal: preserve the subject's facial structure, proportions, and likeness across the whole set.`,
      `Composition: premium editorial travel photography, natural lighting, believable candid posture.`,
      companionProfile
        ? "Ensure both people remain consistent and proportionally accurate relative to each other."
        : "Focus on a single subject with strong identity consistency.",
    ].join(" "),
  }));
}
