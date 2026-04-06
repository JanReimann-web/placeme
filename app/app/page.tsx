"use client";

import Link from "next/link";
import { ArrowRight, FolderPlus, Sparkles, UserRoundPlus } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { JobCard } from "@/components/job-card";
import { LoadingState } from "@/components/loading-state";
import { StatCard } from "@/components/stat-card";
import { useJobs } from "@/hooks/use-jobs";
import { useProfiles } from "@/hooks/use-profiles";

export default function DashboardPage() {
  const { profiles, loading: profilesLoading, error: profilesError } = useProfiles();
  const { jobs, loading: jobsLoading, error: jobsError } = useJobs();

  if (profilesLoading || jobsLoading) {
    return <LoadingState label="Preparing your PlaceMe dashboard" />;
  }

  if (profilesError || jobsError) {
    return (
      <ErrorState
        title="The dashboard could not load your latest data"
        description={profilesError ?? jobsError ?? "Unknown loading error."}
        actionHref="/app"
        actionLabel="Refresh overview"
      />
    );
  }

  const companionCount = profiles.filter((profile) => profile.relationshipType !== "self").length;
  const readyProfiles = profiles.filter((profile) => profile.readinessStatus === "ready").length;
  const recentJobs = jobs.slice(0, 3);

  return (
    <div className="space-y-6">
      <section className="travel-panel rounded-[36px] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--accent-sea)]">
              Overview
            </p>
            <h1 className="display-type mt-4 text-5xl leading-[0.95] text-[var(--ink-strong)]">
              Build a stronger private travel persona library.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-8 text-[var(--ink-soft)] sm:text-base">
              Add yourself, add companions, then generate controlled destination sets to evaluate identity consistency across scenes.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              href="/app/profiles/new"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--surface-dark)] px-5 py-3 text-sm font-semibold text-[var(--surface-base)]"
            >
              <FolderPlus className="h-4 w-4" />
              Create profile
            </Link>
            <Link
              href="/app/profiles/new"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--line-soft)] px-5 py-3 text-sm font-medium text-[var(--ink-soft)]"
            >
              <UserRoundPlus className="h-4 w-4" />
              Add companion
            </Link>
            <Link
              href="/app/generate"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--line-soft)] bg-[var(--surface-subtle)] px-5 py-3 text-sm font-medium text-[var(--ink-strong)]"
            >
              <Sparkles className="h-4 w-4" />
              Start travel photo set
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Profiles" value={profiles.length} helper="Total people in your private library" />
        <StatCard label="Companions" value={companionCount} helper="Shared travel generation options" />
        <StatCard label="Ready" value={readyProfiles} helper="Profiles meeting the 8-photo threshold" />
        <StatCard label="Recent jobs" value={jobs.length} helper="Structured generation attempts to compare" />
      </section>

      <section className="travel-panel rounded-[36px] p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--ink-muted)]">
              Latest jobs
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-[var(--ink-strong)]">
              Your recent travel sets
            </h2>
          </div>
          <Link
            href="/app/jobs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ink-strong)]"
          >
            View all jobs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentJobs.length ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {recentJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState
              title="No generation jobs yet"
              description="Create a ready profile and start a travel photo set to test identity consistency."
              actionHref="/app/generate"
              actionLabel="Start travel photo set"
            />
          </div>
        )}
      </section>
    </div>
  );
}
