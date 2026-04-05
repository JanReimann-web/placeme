"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { ScenePackPreview } from "@/components/scene-pack-preview";
import { useJob, useJobImages } from "@/hooks/use-jobs";
import { formatDateTime } from "@/lib/format";
import { getDestinationLabel, getStyleLabel } from "@/lib/constants";

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const { job, loading } = useJob(params.id);
  const { images, loading: imagesLoading } = useJobImages(params.id);

  if (loading || imagesLoading) {
    return <LoadingState label="Loading job detail" />;
  }

  if (!job) {
    return (
      <EmptyState
        title="Job not found"
        description="This generation job is unavailable or does not belong to your account."
        actionHref="/app/jobs"
        actionLabel="Back to jobs"
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="travel-panel rounded-[36px] p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-sea)]">
              Job detail
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-[var(--ink-strong)]">
              {getDestinationLabel(job.destination)}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--ink-soft)]">
              {job.primaryProfileName}
              {job.companionProfileName ? ` with ${job.companionProfileName}` : ""}
              {` • ${getStyleLabel(job.style)} • ${job.imageCount} images`}
            </p>
          </div>
          <div
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              job.status === "completed"
                ? "bg-emerald-100 text-emerald-700"
                : job.status === "failed"
                  ? "bg-rose-100 text-rose-700"
                  : "bg-[var(--surface-strong)] text-[var(--ink-soft)]"
            }`}
          >
            {job.status}
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">
              Created
            </p>
            <p className="mt-3 text-sm font-semibold text-[var(--ink-strong)]">
              {formatDateTime(job.createdAt)}
            </p>
          </div>
          <div className="rounded-[24px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">
              Mode
            </p>
            <p className="mt-3 text-sm font-semibold text-[var(--ink-strong)]">
              {job.mode === "companion" ? "With companion" : "Solo"}
            </p>
          </div>
          <div className="rounded-[24px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">
              Scene pack
            </p>
            <p className="mt-3 text-sm font-semibold text-[var(--ink-strong)]">
              {job.scenePackId}
            </p>
          </div>
          <div className="rounded-[24px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">
              Provider
            </p>
            <p className="mt-3 text-sm font-semibold text-[var(--ink-strong)]">
              MockGenerationProvider
            </p>
          </div>
        </div>

        {job.errorMessage ? (
          <p className="mt-6 text-sm text-rose-600">{job.errorMessage}</p>
        ) : null}
      </section>

      <ScenePackPreview destination={job.destination} imageCount={job.imageCount} />

      <section className="travel-panel rounded-[36px] p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--ink-muted)]">
              Generated images
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-[var(--ink-strong)]">
              Output grid
            </h2>
          </div>
          <p className="text-sm text-[var(--ink-soft)]">
            Mock outputs are deterministic placeholders saved in the real gallery data model.
          </p>
        </div>

        {images.length ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {images.map((image) => (
              <article
                key={image.id}
                className="overflow-hidden rounded-[28px] border border-[var(--line-soft)] bg-[var(--surface-subtle)]"
              >
                <Image
                  src={image.imageURL}
                  alt={image.sceneKey}
                  unoptimized
                  width={1200}
                  height={1600}
                  className="aspect-[4/5] h-auto w-full object-cover"
                />
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">
                    {image.sceneKey.replaceAll("_", " ")}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[28px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-5 text-sm leading-7 text-[var(--ink-soft)]">
            {job.status === "failed"
              ? "This job failed before output was written."
              : "Outputs will appear here automatically once processing completes."}
          </div>
        )}
      </section>
    </div>
  );
}
