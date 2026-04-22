import { Camera, CheckCircle2, Dog, ScanFace } from "lucide-react";
import type { RelationshipType } from "@/types/domain";

const humanGuidance = [
  "Upload at least 8 sharp photos with front, left-side, right-side, half-body, and full-body coverage.",
  "Use natural light where the face is not hidden by sunglasses, heavy shadows, filters, or motion blur.",
  "Include neutral and smiling expressions so generated scenes can vary without drifting identity.",
  "Keep hair, beard, glasses, and signature accessories visible if they should stay consistent.",
];

const petGuidance = [
  "Upload clear face, side, standing/sitting, and full-body photos so the pet's shape and posture are readable.",
  "Show the neck area clearly. If the pet wears a collar, harness, tag, bow, or leash attachment, include close and full-body references where it is visible.",
  "Capture distinctive fur markings, muzzle, ears, tail, paws, eye color, and size next to familiar objects or people.",
  "Avoid costumes or heavy blankets unless they are part of the look you want repeated in generated scenes.",
];

export function ReferencePhotoGuide({
  relationshipType,
  compact = false,
}: {
  relationshipType?: RelationshipType;
  compact?: boolean;
}) {
  const isPet = relationshipType === "pet";
  const guidance = isPet ? petGuidance : humanGuidance;
  const Icon = isPet ? Dog : ScanFace;

  return (
    <section className={`travel-panel ${compact ? "rounded-2xl p-4" : "rounded-[28px] p-5 sm:p-6"}`}>
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--line-soft)] bg-[var(--surface-strong)] text-[var(--accent-sea)]">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-sea)]">
            Reference photo guide
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[var(--ink-strong)]">
            {isPet ? "Pet identity details matter" : "Make identity easy to preserve"}
          </h3>
          <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
            {isPet
              ? "The generator needs the same pet from every angle, including neck details and any collar or harness that should stay unchanged."
              : "The strongest sets come from references that show the face, body proportions, lighting, and expression without visual noise."}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {guidance.map((item) => (
          <div
            key={item}
            className="flex gap-3 rounded-xl border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-3"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-sea)]" />
            <p className="text-sm leading-6 text-[var(--ink-soft)]">{item}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--line-soft)] bg-white/60 px-3 py-2 text-sm text-[var(--ink-soft)]">
        <Camera className="h-4 w-4 text-[var(--accent-sand)]" />
        <span>
          Use real, unedited references. The generated result should follow the reference identity, not invent a new one.
        </span>
      </div>
    </section>
  );
}
