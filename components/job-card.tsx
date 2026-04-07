import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatCompactDate } from "@/lib/format";
import { getDestinationLabel, getStyleLabel } from "@/lib/constants";
import type { GenerationJob } from "@/types/domain";

export function JobCard({ job }: { job: GenerationJob }) {
  return (
    <div className="travel-panel rounded-[30px] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--ink-muted)]">
            {job.mode === "companion" ? "With companion" : "Solo"}
          </p>
          <h3 className="mt-3 text-[1.7rem] font-semibold text-[var(--ink-strong)] sm:text-2xl">
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
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
              : job.status === "failed"
                ? "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
                : "bg-[var(--surface-strong)] text-[var(--ink-soft)]"
          }`}
        >
          {job.status}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[20px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] px-3 py-3 text-sm text-[var(--ink-soft)]">
          {getStyleLabel(job.style)}
        </div>
        <div className="rounded-[20px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] px-3 py-3 text-sm text-[var(--ink-soft)]">
          {job.imageCount} images
        </div>
        <div className="rounded-[20px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] px-3 py-3 text-sm text-[var(--ink-soft)]">
          {formatCompactDate(job.createdAt)}
        </div>
      </div>

      <Link
        href={`/app/jobs/${job.id}`}
        className="premium-pressable premium-action mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold sm:w-auto"
      >
        View job
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
