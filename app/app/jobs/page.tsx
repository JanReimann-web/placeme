"use client";

import { useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { JobCard } from "@/components/job-card";
import { LoadingState } from "@/components/loading-state";
import { PageHero } from "@/components/page-hero";
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
      <PageHero
        eyebrow="Jobs"
        title="Generation history"
        description="Track each travel set from queue to finish and jump back into the ones worth keeping."
      >
        <div className="flex flex-wrap gap-2.5 sm:gap-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-3.5 py-2 text-sm font-semibold sm:px-4 ${
                activeTab === tab
                  ? "premium-pressable premium-chip-button premium-chip-button-active"
                  : "premium-pressable premium-chip-button"
              }`}
            >
              {JOB_STATUS_LABELS[tab]}
            </button>
          ))}
        </div>
      </PageHero>

      {filteredJobs.length ? (
        <section className="snap-rail snap-rail-lg-grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
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
