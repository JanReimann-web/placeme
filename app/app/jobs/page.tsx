"use client";

import { useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { JobCard } from "@/components/job-card";
import { LoadingState } from "@/components/loading-state";
import { useJobs } from "@/hooks/use-jobs";
import { JOB_STATUS_LABELS } from "@/lib/constants";

const tabs = ["all", "pending", "processing", "completed", "failed"] as const;

export default function JobsPage() {
  const { jobs, loading, error } = useJobs();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("all");

  if (loading) {
    return <LoadingState label="Loading generation jobs" />;
  }

  if (error) {
    return (
      <ErrorState
        title="Generation jobs are unavailable right now"
        description={error}
        actionHref="/app"
        actionLabel="Back to overview"
      />
    );
  }

  const filteredJobs =
    activeTab === "all"
      ? jobs
      : jobs.filter((job) => job.status === activeTab);

  return (
    <div className="space-y-6">
      <section className="travel-panel rounded-[36px] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-sea)]">
          Jobs
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-[var(--ink-strong)]">
          Generation history
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--ink-soft)]">
          Track every travel set from creation to completion and revisit the strongest
          results later in the gallery.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                activeTab === tab
                  ? "premium-pressable premium-chip-button premium-chip-button-active"
                  : "premium-pressable premium-chip-button"
              }`}
            >
              {JOB_STATUS_LABELS[tab]}
            </button>
          ))}
        </div>
      </section>

      {filteredJobs.length ? (
        <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </section>
      ) : (
        <EmptyState
          title="No jobs in this status"
          description="Create a new travel photo set or switch tabs to review other job states."
          actionHref="/app/generate"
          actionLabel="Start travel photo set"
        />
      )}
    </div>
  );
}
