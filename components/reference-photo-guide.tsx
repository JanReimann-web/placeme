import { Camera, CheckCircle2, Dog, ScanFace } from "lucide-react";
import type { RelationshipType } from "@/types/domain";

const humanGuidance = [
  "At least 8 sharp photos.",
  "Front, side, half-body, and full-body angles.",
  "Clear light, no heavy filters or motion blur.",
  "Show hair, glasses, beard, and key accessories.",
];

const petGuidance = [
  "Clear face, side, sitting/standing, and full-body photos.",
  "Show neck, collar, harness, tag, bow, or leash details.",
  "Capture fur markings, muzzle, ears, paws, tail, and eye color.",
  "Avoid costumes unless they should repeat in every scene.",
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
            {isPet ? "Pet reference details" : "Identity references"}
          </h3>
          <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
            {isPet
              ? "Include the neck area and anything the pet wears."
              : "Show face, body proportions, lighting, and expression clearly."}
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
        <span>Use real, clear, unedited references.</span>
      </div>
    </section>
  );
}
