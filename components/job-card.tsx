import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatCompactDate } from "@/lib/format";
import { getDestinationLabel, getStyleLabel } from "@/lib/constants";
import type { GenerationJob } from "@/types/domain";

export function JobCard({ job }: { job: GenerationJob }) {
  return (
    <div className="travel-panel rounded-[28px] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--ink-muted)]">
            {job.mode === "companion" ? "With companion" : "Solo"}
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-[var(--ink-strong)]">
            {getDestinationLabel(job.destination)}
          </h3>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            {job.primaryProfileName}
            {job.companionProfileName ? ` + ${job.companionProfileName}` : ""}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            job.status === "completed"
              ? "bg-emerald-100 text-emerald-700"
              : job.status === "failed"
                ? "bg-rose-100 text-rose-700"
                : "bg-[var(--surface-strong)] text-[var(--ink-soft)]"
          }`}
        >
          {job.status}
        </span>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-[var(--ink-soft)] sm:grid-cols-3">
        <p>{getStyleLabel(job.style)}</p>
        <p>{job.imageCount} images</p>
        <p>{formatCompactDate(job.createdAt)}</p>
      </div>

      <Link
        href={`/app/jobs/${job.id}`}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--surface-dark)] px-4 py-2.5 text-sm font-semibold text-[var(--surface-base)]"
      >
        View job
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
