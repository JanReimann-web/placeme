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
      "Priority rule: exact identity is more important than cinematic styling, pose complexity, wardrobe flair, or dramatic background composition. If something must give, preserve the person first.",
      "Identity lock: this must look like the exact same real person from the reference photos, not a similar stranger, beautified variant, or lookalike.",
      "Preserve face identity exactly: keep forehead height, face width, eye shape and spacing, eyelid shape, nose bridge and nose width, lips, chin, jawline, ear shape, hairline, eyebrow shape, skin tone, age impression, and hairstyle consistent with the references.",
      "Do not beautify or idealize the subject. Do not make the face younger, smoother, slimmer, sharper, more symmetrical, or more conventionally attractive than in the references.",
      "Preserve body identity exactly: keep body build, neck thickness, shoulder width, torso proportions, limb proportions, hands, fingers, posture tendencies, and overall silhouette consistent with the references. Do not slim down, bulk up, elongate, or restyle the person.",
      "Accessory continuity: keep jewelry, rings, watches, bracelets, earrings, necklaces, tattoos, and other visible personal details consistent with the references. If something is not clearly present in the references, do not invent it.",
      `Background realism: render ${getDestinationLabel(input.destination)} as a believable real-world location for this scene, with architecture, skyline, streetscape, materials, and lighting that fit the actual place instead of a generic or fictional lookalike.`,
      "Composition: premium editorial travel photography, natural lighting, believable candid posture, calm luxury travel mood.",
      input.companionProfile
        ? "Ensure both people remain consistent and proportionally accurate relative to each other, with no face swapping or duplicate people."
        : "Focus on a single subject with strong identity consistency, natural hand anatomy, and no extra people in the foreground.",
    ].join(" "),
    // TODO(Gemini): tune this negative prompt once the real provider is wired in.
    negativePrompt:
      "low quality, distorted anatomy, identity drift, different person, beautified face, younger face, smoother skin, larger eyes, altered eye spacing, altered nose shape, altered jawline, slimmer face, different hairline, altered body type, elongated limbs, bad hands, extra fingers, missing fingers, duplicate subject, invented accessories, unrealistic lighting, generic fantasy skyline, collage, text overlay, split screen",
  }));
}
