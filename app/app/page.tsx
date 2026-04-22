"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Camera,
  FolderOpen,
  ImageIcon,
  WandSparkles,
} from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { useAuth } from "@/hooks/use-auth";
import { useJobs } from "@/hooks/use-jobs";
import { useProfiles } from "@/hooks/use-profiles";
import { getDestinationLabel, getStyleLabel } from "@/lib/constants";
import { formatCompactDate } from "@/lib/format";

function getFirstName(name?: string | null) {
  if (!name) {
    return "there";
  }

  return name.trim().split(/\s+/)[0] ?? "there";
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="travel-panel rounded-[20px] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--ink-strong)]">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{detail}</p>
    </div>
  );
}

function ActionCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="premium-pressable travel-panel block rounded-[20px] p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--line-soft)] bg-[var(--surface-strong)] text-[var(--accent-sea)]">
          {icon}
        </div>
        <ArrowUpRight className="h-5 w-5 text-[var(--ink-muted)]" />
      </div>
      <h2 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-[var(--ink-strong)]">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
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
  const readyProfiles = profiles.filter((profile) => profile.readinessStatus === "ready");
  const totalPhotos = profiles.reduce((sum, profile) => sum + profile.photoCount, 0);
  const completedJobs = jobs.filter((job) => job.status === "completed");
  const activeJob =
    jobs.find((job) => job.status === "processing") ??
    jobs.find((job) => job.status === "pending");
  const recentJobs = jobs.slice(0, 3);

  const nextAction = !profiles.length
    ? {
        title: "Create your first reference profile",
        description: "Add one person or pet and upload clear references.",
        href: "/app/profiles/new",
        label: "Create profile",
      }
    : !readyProfiles.length
      ? {
          title: "Finish one profile before generating",
          description: "Add the missing photos and tags.",
          href: "/app/profiles",
          label: "Open profiles",
        }
      : activeJob
        ? {
            title: `${getDestinationLabel(activeJob.destination)} is ${activeJob.status}`,
            description: "Open the job to see progress.",
            href: `/app/jobs/${activeJob.id}`,
            label: "View active job",
          }
        : !completedJobs.length
          ? {
              title: "Create your first photo set",
              description: "Pick a scene or write your own brief.",
              href: "/app/generate",
              label: "Generate photos",
            }
          : {
              title: "Review the strongest finished images",
              description: "Open the gallery and keep the best shots.",
              href: "/app/gallery",
              label: "Open gallery",
            };

  return (
    <div className="space-y-6">
      <section className="travel-panel rounded-[24px] p-5 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-sea)]">
              Studio overview
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--ink-strong)] sm:text-4xl">
              Welcome back, {firstName}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
              Prepare references, generate scenes, keep the best shots.
            </p>
          </div>
          <Link
            href="/app/generate"
            className="premium-pressable premium-action inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
          >
            <Camera className="h-4 w-4" />
            New photo set
          </Link>
        </div>
      </section>

      <section className="travel-panel rounded-[24px] p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-sea)]">
              Next best action
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--ink-strong)]">
              {nextAction.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
              {nextAction.description}
            </p>
          </div>
          <Link
            href={nextAction.href}
            className="premium-pressable premium-action inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold sm:w-auto"
          >
            {nextAction.label}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Ready profiles"
          value={profilesLoading ? "..." : `${readyProfiles.length}/${profiles.length}`}
          detail="Ready for image sets."
        />
        <MetricCard
          label="Reference photos"
          value={profilesLoading ? "..." : String(totalPhotos)}
          detail="Across all profiles."
        />
        <MetricCard
          label="Completed sets"
          value={jobsLoading ? "..." : String(completedJobs.length)}
          detail="Saved in gallery."
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <ActionCard
          href="/app/profiles"
          icon={<FolderOpen className="h-5 w-5" />}
          title="Prepare references"
          description="Add photos and tags."
        />
        <ActionCard
          href="/app/generate"
          icon={<WandSparkles className="h-5 w-5" />}
          title="Generate a set"
          description="Guided scene or custom brief."
        />
        <ActionCard
          href="/app/gallery"
          icon={<ImageIcon className="h-5 w-5" />}
          title="Review outputs"
          description="Download the best results."
        />
      </section>

      <section className="travel-panel rounded-[24px] p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-sea)]">
              Recent jobs
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--ink-strong)]">
              Latest generation activity
            </h2>
          </div>
          <Link
            href="/app/jobs"
            className="premium-pressable premium-ghost-action inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold sm:w-auto"
          >
            View all jobs
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {recentJobs.length ? (
          <div className="mt-5 divide-y divide-[var(--line-soft)]">
            {recentJobs.map((job) => (
              <Link
                key={job.id}
                href={`/app/jobs/${job.id}`}
                className="premium-pressable flex flex-col gap-3 rounded-xl px-1 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--ink-strong)]">
                    {getDestinationLabel(job.destination)} - {getStyleLabel(job.style)}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
                    {job.customTravelRequest ??
                      `${job.primaryProfileName}${job.companionProfileName ? ` + ${job.companionProfileName}` : ""}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="rounded-full border border-[var(--line-soft)] bg-[var(--surface-subtle)] px-3 py-1 text-xs font-semibold text-[var(--ink-soft)]">
                    {job.status}
                  </span>
                  <span className="text-sm text-[var(--ink-muted)]">
                    {formatCompactDate(job.createdAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState
              title="No generation jobs yet"
              description="Once you create a profile and start a set, the latest jobs will appear here."
              actionHref="/app/generate"
              actionLabel="Start first set"
            />
          </div>
        )}
      </section>

    </div>
  );
}
