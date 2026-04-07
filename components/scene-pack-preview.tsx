import { getDestinationLabel, getSceneSelection } from "@/lib/constants";
import type { DestinationKey } from "@/types/domain";

export function ScenePackPreview({
  destination,
  imageCount,
}: {
  destination: DestinationKey;
  imageCount: 8 | 10 | 12;
}) {
  const scenes = getSceneSelection(destination, imageCount);

  return (
    <div className="travel-panel rounded-[30px] p-5 sm:rounded-[32px] sm:p-8">
      <div className="travel-gradient rounded-[24px] p-4 sm:rounded-[28px] sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-sea)]">
              Scene pack preview
            </p>
            <h3 className="mt-3 text-[1.75rem] font-semibold text-[var(--ink-strong)] sm:text-2xl">
              {getDestinationLabel(destination)}
            </h3>
            <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
              A curated scene sequence designed to keep the set cohesive while still
              giving you enough variation to compare the results properly.
            </p>
          </div>
          <span className="rounded-full border border-[var(--line-soft)] bg-[var(--surface-subtle)] px-4 py-2 text-sm font-semibold text-[var(--ink-strong)]">
            {imageCount} scenes selected
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {scenes.map((scene, index) => (
          <div
            key={scene.key}
            className="rounded-[24px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">
                  Scene {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-2 text-base font-semibold text-[var(--ink-strong)] sm:text-lg">
                  {scene.title}
                </p>
              </div>
              <span className="rounded-full bg-[var(--surface-strong)] px-3 py-1 text-[11px] font-semibold text-[var(--ink-soft)]">
                Controlled
              </span>
            </div>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
              {scene.description}
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-sand)]">
              Wardrobe hint
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
              {scene.wardrobeHint}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
