import { CheckCircle2, Circle } from "lucide-react";
import { PROFILE_CHECKLIST_ITEMS } from "@/lib/constants";
import { getReadinessSummary } from "@/lib/readiness";
import type { Profile } from "@/types/domain";

export function ReadinessChecklist({ profile }: { profile: Profile }) {
  const summary = getReadinessSummary(profile);

  return (
    <div className="travel-panel rounded-[28px] p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-sea)]">
            Readiness
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-[var(--ink-strong)]">
            {summary.coveredItems}/{summary.totalItems} checklist areas covered
          </h3>
          <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
            {summary.message}
          </p>
        </div>
        <div className="rounded-full bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--ink-strong)]">
          {profile.photoCount}/8 minimum photos
        </div>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-[var(--line-soft)]">
        <div
          className="h-full rounded-full bg-[var(--accent-sea)] transition-all"
          style={{ width: `${summary.coveragePercent}%` }}
        />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {PROFILE_CHECKLIST_ITEMS.map((item) => {
          const complete = profile.checklistCoverage[item.key];

          return (
            <div
              key={item.key}
              className="rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-4"
            >
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
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                {item.hint}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
