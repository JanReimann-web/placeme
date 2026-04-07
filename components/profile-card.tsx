import Link from "next/link";
import { ArrowUpRight, Trash2 } from "lucide-react";
import { formatCompactDate } from "@/lib/format";
import { getRelationshipLabel } from "@/lib/constants";
import { getReadinessSummary } from "@/lib/readiness";
import type { Profile } from "@/types/domain";

export function ProfileCard({
  profile,
  onDelete,
}: {
  profile: Profile;
  onDelete?: (profile: Profile) => void;
}) {
  const summary = getReadinessSummary(profile);

  return (
    <div className="travel-panel rounded-[30px] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--ink-muted)]">
            {getRelationshipLabel(profile.relationshipType)}
          </p>
          <h3 className="mt-3 text-[1.7rem] font-semibold text-[var(--ink-strong)] sm:text-2xl">
            {profile.displayName}
          </h3>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            {profile.photoCount} reference photos
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            profile.readinessStatus === "ready"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
              : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
          }`}
        >
          {profile.readinessStatus === "ready" ? "Ready" : "Incomplete"}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[22px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">
            Photo base
          </p>
          <p className="mt-3 text-2xl font-semibold text-[var(--ink-strong)]">
            {profile.photoCount}/{summary.minimumPhotoTarget}
          </p>
        </div>
        <div className="rounded-[22px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">
            Checklist
          </p>
          <p className="mt-3 text-2xl font-semibold text-[var(--ink-strong)]">
            {summary.coveredItems}/{summary.totalItems}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div>
          <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
            <span>Readiness progress</span>
            <span>{Math.max(summary.photoProgressPercent, summary.coveragePercent)}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--line-soft)]">
            <div
              className="h-full rounded-full bg-[var(--accent-sea)]"
              style={{ width: `${Math.max(summary.photoProgressPercent, summary.coveragePercent)}%` }}
            />
          </div>
        </div>
        <p className="text-sm leading-7 text-[var(--ink-soft)]">
          {summary.nextAction}
        </p>
      </div>

      <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
        Last updated {formatCompactDate(profile.updatedAt)}
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href={`/app/profiles/${profile.id}`}
          className="premium-pressable premium-action inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold sm:w-auto"
        >
          View profile
          <ArrowUpRight className="h-4 w-4" />
        </Link>
        {onDelete ? (
          <button
            type="button"
            onClick={() => onDelete(profile)}
            className="premium-pressable premium-ghost-action inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium sm:w-auto"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        ) : null}
      </div>
    </div>
  );
}
