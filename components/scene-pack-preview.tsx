import { getSceneSelection } from "@/lib/constants";
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
    <div className="travel-panel rounded-[28px] p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-sea)]">
        Scene pack preview
      </p>
      <h3 className="mt-3 text-2xl font-semibold text-[var(--ink-strong)]">
        {scenes.length} controlled destination scenes
      </h3>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {scenes.map((scene, index) => (
          <div
            key={scene.key}
            className="rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">
              Scene {String(index + 1).padStart(2, "0")}
            </p>
            <p className="mt-2 text-lg font-semibold text-[var(--ink-strong)]">
              {scene.title}
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
              {scene.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
