"use client";

import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { useAppDataContext } from "@/components/app-data-provider";

function formatDestinationLabel(destination?: string | null) {
  if (!destination) {
    return "Travel set";
  }

  return destination
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getProgressMeta(status?: string, processedSceneCount?: number | null, imageCount?: number) {
  if (status === "completed") {
    return { label: "Completed", percent: 100 };
  }

  if (status === "processing") {
    if (typeof processedSceneCount === "number" && imageCount) {
      return {
        label: "Processing",
        percent: Math.max(12, Math.min(92, Math.round((processedSceneCount / imageCount) * 100))),
      };
    }

    return { label: "Processing", percent: 68 };
  }

  if (status === "pending") {
    return { label: "Queued", percent: 18 };
  }

  return { label: "Ready", percent: 0 };
}

export function GlobalProcessingCard() {
  const appData = useAppDataContext();
  const jobs = appData?.jobs.items ?? [];
  const loading = appData?.jobs.loading ?? false;
  const activeJob =
    jobs.find((job) => job.status === "processing") ??
    jobs.find((job) => job.status === "pending");

  if (loading || !activeJob) {
    return null;
  }

  const progressMeta = getProgressMeta(
    activeJob.status,
    activeJob.processedSceneCount,
    activeJob.imageCount,
  );

  return (
    <Link
      href={`/app/jobs/${activeJob.id}`}
      className="travel-panel premium-pressable block rounded-[28px] border border-[rgba(181,164,239,0.36)] bg-white/86 px-4 py-4 shadow-[0_18px_42px_rgba(72,46,130,0.1)] sm:rounded-[32px] sm:px-5"
    >
      <div className="flex items-start gap-4 sm:items-center">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[rgba(124,82,219,0.18)] bg-[linear-gradient(180deg,rgba(214,194,255,0.4),rgba(170,130,246,0.2))] text-[var(--surface-dark)] shadow-[0_12px_24px_rgba(87,40,158,0.08)] sm:h-14 sm:w-14">
          <LoaderCircle className="h-7 w-7" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:gap-2 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-[1rem] font-medium tracking-[-0.03em] text-[var(--ink-strong)] sm:text-[1.25rem]">
              {progressMeta.label}: {formatDestinationLabel(activeJob.destination)} ({progressMeta.percent}%)
            </p>
            <span className="text-[11px] uppercase tracking-[0.24em] text-[var(--ink-muted)] sm:text-xs">
              {activeJob.imageCount} images
            </span>
          </div>
          <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
            {activeJob.primaryProfileName}
            {activeJob.companionProfileName ? ` + ${activeJob.companionProfileName}` : ""}
          </p>
          <div className="mt-4 h-3.5 overflow-hidden rounded-full bg-[rgba(230,220,244,0.92)]">
            <div
              className="h-full rounded-full bg-[var(--surface-dark)] transition-all"
              style={{ width: `${progressMeta.percent}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
