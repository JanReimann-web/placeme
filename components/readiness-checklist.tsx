import { CheckCircle2, Circle, Images, ScanFace, Sparkles } from "lucide-react";
import { getChecklistItemsForRelationship } from "@/lib/constants";
import { getReadinessSummary } from "@/lib/readiness";
import type { Profile } from "@/types/domain";

export function ReadinessChecklist({ profile }: { profile: Profile }) {
  const summary = getReadinessSummary(profile);
  const checklistItems = getChecklistItemsForRelationship(profile.relationshipType);
  const ready = profile.readinessStatus === "ready";

  return (
    <div className="travel-panel rounded-[30px] p-5 sm:rounded-[32px] sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-sea)]">
            Readiness
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                ready
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
              }`}
            >
              {summary.statusLabel}
            </span>
            <p className="text-sm text-[var(--ink-soft)]">{summary.nextAction}</p>
          </div>
          <h3 className="mt-4 text-[1.75rem] font-semibold text-[var(--ink-strong)] sm:text-2xl">
            {summary.coveredItems}/{summary.totalItems} checklist areas covered
          </h3>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--ink-soft)]">
            {summary.message}
          </p>
        </div>

        <div className="grid w-full gap-3 sm:max-w-sm sm:grid-cols-2">
          <div className="rounded-[24px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-4">
            <div className="flex items-center gap-2 text-[var(--accent-sea)]">
              <Images className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.24em]">
                Photo base
              </p>
            </div>
            <p className="mt-3 text-2xl font-semibold text-[var(--ink-strong)]">
              {profile.photoCount}/{summary.minimumPhotoTarget}
            </p>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">
              Minimum photos for generation.
            </p>
          </div>

          <div className="rounded-[24px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-4">
            <div className="flex items-center gap-2 text-[var(--accent-sand)]">
              <ScanFace className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.24em]">
                Manual coverage
              </p>
            </div>
            <p className="mt-3 text-2xl font-semibold text-[var(--ink-strong)]">
              {summary.coveragePercent}%
            </p>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">
              Checklist areas tagged across photos.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-5">
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[var(--ink-strong)]">
                  Photo threshold
                </p>
                <p className="text-sm text-[var(--ink-soft)]">
                  {profile.photoCount}/{summary.minimumPhotoTarget}
                </p>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-[var(--line-soft)]">
                <div
                  className="h-full rounded-full bg-[var(--accent-sea)] transition-all"
                  style={{ width: `${summary.photoProgressPercent}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[var(--ink-strong)]">
                  Checklist coverage
                </p>
                <p className="text-sm text-[var(--ink-soft)]">
                  {summary.coveredItems}/{summary.totalItems}
                </p>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-[var(--line-soft)]">
                <div
                  className="h-full rounded-full bg-[var(--accent-sand)] transition-all"
                  style={{ width: `${summary.coveragePercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="travel-gradient rounded-[28px] p-5">
          <div className="flex items-center gap-2 text-[var(--accent-sea)]">
            <Sparkles className="h-4 w-4" />
            <p className="text-xs font-semibold uppercase tracking-[0.24em]">
              Best next move
            </p>
          </div>
          {summary.missingItems.length ? (
            <>
              <p className="mt-4 text-sm font-semibold text-[var(--ink-strong)]">
                Prioritize missing manual tags
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {summary.missingItems.map((item) => (
                  <span
                    key={item.key}
                    className="rounded-full border border-[var(--line-soft)] bg-[var(--surface-subtle)] px-3 py-2 text-xs font-semibold text-[var(--ink-soft)]"
                  >
                    {item.label}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
              This profile has coverage across all current manual checklist areas.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {checklistItems.map((item) => {
          const complete = profile.checklistCoverage[item.key];

          return (
            <div
              key={item.key}
              className="rounded-[24px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {complete ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-[var(--ink-muted)]" />
                  )}
                  <p className="font-semibold text-[var(--ink-strong)]">
                    {item.label}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                    complete
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                      : "bg-[var(--surface-strong)] text-[var(--ink-soft)]"
                  }`}
                >
                  {complete ? "Covered" : "Pending"}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                {item.hint}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
