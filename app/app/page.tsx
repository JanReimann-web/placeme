"use client";

import Link from "next/link";
import {
  Camera,
  FolderOpen,
  Globe,
  ImageIcon,
  LoaderCircle,
} from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { useAuth } from "@/hooks/use-auth";
import { useJobs } from "@/hooks/use-jobs";
import { useProfiles } from "@/hooks/use-profiles";

function getFirstName(name?: string | null) {
  if (!name) {
    return "there";
  }

  return name.trim().split(/\s+/)[0] ?? "there";
}

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
    if (processedSceneCount && imageCount) {
      return {
        label: "Processing",
        percent: Math.max(18, Math.min(92, Math.round((processedSceneCount / imageCount) * 100))),
      };
    }

    return { label: "Processing", percent: 68 };
  }

  if (status === "pending") {
    return { label: "Queued", percent: 22 };
  }

  if (status === "failed") {
    return { label: "Needs retry", percent: 100 };
  }

  return { label: "Ready", percent: 0 };
}

function OverviewCard({
  href,
  icon,
  title,
  description,
  className = "",
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`premium-pressable travel-panel group rounded-[34px] border border-[rgba(214,193,156,0.68)] bg-white/84 p-7 shadow-[0_22px_44px_rgba(77,58,30,0.08)] hover:bg-white ${className}`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(227,213,182,0.46)] text-[var(--ink-strong)]">
        {icon}
      </div>
      <h2 className="mt-8 text-[2rem] font-semibold tracking-[-0.04em] text-[var(--ink-strong)]">
        {title}
      </h2>
      <p className="mt-2 text-[1.15rem] leading-8 text-[var(--ink-soft)]">
        {description}
      </p>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { profiles, loading: profilesLoading, error: profilesError } = useProfiles();
  const { jobs, loading: jobsLoading, error: jobsError } = useJobs();

  if ((profilesError && !profiles.length) || (jobsError && !jobs.length)) {
    return (
      <ErrorState
        title="The overview could not load your studio data"
        description={profilesError ?? jobsError ?? "Unknown loading error."}
        actionHref="/app"
        actionLabel="Refresh home"
      />
    );
  }

  const firstName = getFirstName(user?.displayName);
  const totalPhotos = profiles.reduce((sum, profile) => sum + profile.photoCount, 0);
  const completedJobs = jobs.filter((job) => job.status === "completed");
  const activeJob =
    jobs.find((job) => job.status === "processing") ??
    jobs.find((job) => job.status === "pending") ??
    jobs[0];
  const progressMeta = getProgressMeta(
    activeJob?.status,
    activeJob?.processedSceneCount,
    activeJob?.imageCount,
  );

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="travel-panel rounded-[36px] border border-[rgba(215,196,162,0.72)] bg-white/86 px-6 py-7 shadow-[0_24px_54px_rgba(77,58,30,0.08)] sm:px-8 sm:py-8 md:px-10 md:py-10">
        <div className="max-w-4xl">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--ink-muted)]">
            Private studio
          </p>
          <h1 className="display-type mt-6 text-[4.3rem] leading-[0.95] tracking-[-0.05em] text-[var(--ink-strong)] sm:text-[5.4rem] lg:text-[6.6rem]">
            Hello, {firstName}!
          </h1>

          <Link
            href="/app/generate"
            className="premium-pressable premium-action mt-8 inline-flex w-full items-center justify-center gap-4 rounded-full px-6 py-5 text-[1.35rem] font-medium tracking-[-0.03em] sm:w-auto sm:min-w-[26rem] sm:px-10"
          >
            <Camera className="h-7 w-7" />
            Generate New Travel Photo
          </Link>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <OverviewCard
          href="/app/profiles"
          icon={<FolderOpen className="h-8 w-8" />}
          title="Profile Library"
          description={
            profilesLoading
              ? "Syncing your profile library..."
              : `Manage ${totalPhotos} photos across ${profiles.length} profiles.`
          }
        />
        <OverviewCard
          href="/app/generate"
          icon={<Globe className="h-8 w-8" />}
          title="Scene Packs"
          description="Paris, Tokyo, New York, Dubai"
        />
        <OverviewCard
          href="/app/gallery"
          icon={<ImageIcon className="h-8 w-8" />}
          title="Recent Creations"
          description={
            jobsLoading
              ? "Checking your latest travel sets..."
              : completedJobs.length
                ? `View ${completedJobs.length} finished travel set${completedJobs.length > 1 ? "s" : ""}.`
              : "View latest outputs as soon as your first set finishes."
          }
          className="md:col-span-2"
        />
      </section>

      {jobsLoading && !jobs.length ? (
        <section className="travel-panel rounded-[36px] border border-[rgba(215,196,162,0.72)] bg-white/86 px-5 py-5 shadow-[0_18px_42px_rgba(77,58,30,0.08)] sm:px-6">
          <p className="text-sm leading-7 text-[var(--ink-soft)]">
            Checking recent generation progress...
          </p>
        </section>
      ) : activeJob ? (
        <section className="travel-panel rounded-[36px] border border-[rgba(215,196,162,0.72)] bg-white/86 px-5 py-5 shadow-[0_18px_42px_rgba(77,58,30,0.08)] sm:px-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(215,196,162,0.78)] bg-[rgba(255,250,243,0.9)] text-[var(--ink-muted)]">
              <LoaderCircle className="h-7 w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <p className="truncate text-[1.2rem] font-medium tracking-[-0.03em] text-[var(--ink-strong)] sm:text-[1.45rem]">
                  {progressMeta.label}: {formatDestinationLabel(activeJob.destination)} ({progressMeta.percent}%)
                </p>
                <span className="text-sm uppercase tracking-[0.24em] text-[var(--ink-muted)]">
                  {activeJob.imageCount} images
                </span>
              </div>
              <div className="mt-4 h-4 overflow-hidden rounded-full bg-[rgba(239,230,213,0.95)]">
                <div
                  className="h-full rounded-full bg-[var(--surface-dark)] transition-all"
                  style={{ width: `${progressMeta.percent}%` }}
                />
              </div>
            </div>
          </div>
        </section>
      ) : (
        <EmptyState
          title="Your first travel set will show up here"
          description="Create a profile, then generate a destination photo set to start reviewing outputs."
          actionHref="/app/generate"
          actionLabel="Open generate"
        />
      )}
    </div>
  );
}
