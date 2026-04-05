import Link from "next/link";
import { ArrowUpRight, Trash2 } from "lucide-react";
import { formatCompactDate } from "@/lib/format";
import { getRelationshipLabel } from "@/lib/constants";
import type { Profile } from "@/types/domain";

export function ProfileCard({
  profile,
  onDelete,
}: {
  profile: Profile;
  onDelete?: (profile: Profile) => void;
}) {
  return (
    <div className="travel-panel rounded-[28px] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--ink-muted)]">
            {getRelationshipLabel(profile.relationshipType)}
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-[var(--ink-strong)]">
            {profile.displayName}
          </h3>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            {profile.photoCount} reference photos
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            profile.readinessStatus === "ready"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {profile.readinessStatus === "ready" ? "Ready" : "Incomplete"}
        </span>
      </div>

      <p className="mt-5 text-sm leading-7 text-[var(--ink-soft)]">
        Last updated {formatCompactDate(profile.updatedAt)}
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Link
          href={`/app/profiles/${profile.id}`}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-dark)] px-4 py-2.5 text-sm font-semibold text-[var(--surface-base)]"
        >
          View profile
          <ArrowUpRight className="h-4 w-4" />
        </Link>
        {onDelete ? (
          <button
            type="button"
            onClick={() => onDelete(profile)}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--line-soft)] px-4 py-2.5 text-sm font-medium text-[var(--ink-soft)] transition hover:border-[var(--line-strong)] hover:text-[var(--ink-strong)]"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        ) : null}
      </div>
    </div>
  );
}
