"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Download, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useAuth } from "@/hooks/use-auth";
import { useJob, useJobImages } from "@/hooks/use-jobs";
import { formatDateTime } from "@/lib/format";
import { getDestinationLabel, getStyleLabel } from "@/lib/constants";
import { deleteGeneratedImage } from "@/services/job-service";

const ScenePackPreview = dynamic(
  () =>
    import("@/components/scene-pack-preview").then((module) => ({
      default: module.ScenePackPreview,
    })),
  {
    loading: () => (
      <div className="travel-panel rounded-[30px] p-5 sm:rounded-[32px] sm:p-8">
        <p className="text-sm leading-7 text-[var(--ink-soft)]">
          Loading scene pack preview...
        </p>
      </div>
    ),
  },
);

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const { job, loading, error: jobError } = useJob(params.id);
  const { images, loading: imagesLoading, error: imagesError } = useJobImages(
    params.id,
  );
  const [busyImageId, setBusyImageId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleDeleteImage = async (imageId: string) => {
    if (!user) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this generated image from your private library?",
    );

    if (!confirmed) {
      return;
    }

    setBusyImageId(imageId);
    setActionError(null);

    try {
      await deleteGeneratedImage(user.uid, imageId);
    } catch (nextError) {
      setActionError(
        nextError instanceof Error ? nextError.message : "Image deletion failed.",
      );
    } finally {
      setBusyImageId(null);
    }
  };

  if (loading && !job) {
    return <LoadingState label="Loading job detail" />;
  }

  if (jobError) {
    return (
      <ErrorState
        title="This generation job could not be loaded"
        description={jobError}
        actionHref="/app/jobs"
        actionLabel="Back to jobs"
      />
    );
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
      <section className="travel-panel rounded-[30px] p-5 sm:rounded-[36px] sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-sea)]">
              Job detail
            </p>
            <h1 className="mt-3 text-[2.35rem] font-semibold tracking-[-0.04em] text-[var(--ink-strong)] sm:mt-4 sm:text-4xl">
              {getDestinationLabel(job.destination)}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--ink-soft)]">
              {`${job.primaryProfileName}${
                job.companionProfileName ? ` with ${job.companionProfileName}` : ""
              } - ${getStyleLabel(job.style)} - ${job.imageCount} images`}
            </p>
          </div>
          <div
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              job.status === "completed"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                : job.status === "failed"
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
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
              Progress
            </p>
            <p className="mt-3 text-sm font-semibold text-[var(--ink-strong)]">
              {job.processedSceneCount ?? 0}/{job.imageCount} scenes
            </p>
          </div>
          <div className="rounded-[24px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">
              Processing
            </p>
            <p className="mt-3 text-sm font-semibold text-[var(--ink-strong)]">
              {job.providerId?.includes("gemini")
                ? "Gemini image generation"
                : job.status === "completed"
                  ? "Finished"
                  : job.status === "failed"
                    ? "Needs attention"
                    : "Running in background"}
            </p>
          </div>
        </div>

        {job.errorMessage ? (
          <div className="mt-6 rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            {job.errorMessage}
          </div>
        ) : null}
      </section>

      <ScenePackPreview destination={job.destination} imageCount={job.imageCount} />

      <section className="travel-panel rounded-[30px] p-5 sm:rounded-[36px] sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--ink-muted)]">
              Generated images
            </p>
            <h2 className="mt-3 text-[2rem] font-semibold text-[var(--ink-strong)] sm:text-3xl">
              Output grid
            </h2>
          </div>
          <p className="text-sm text-[var(--ink-soft)]">
            Each finished scene appears here automatically and is also added to the gallery.
          </p>
        </div>

        {imagesError ? (
          <div className="mt-6 rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            {imagesError}
          </div>
        ) : actionError ? (
          <div className="mt-6 rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {actionError}
          </div>
        ) : imagesLoading ? (
          <div className="mt-6 rounded-[28px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-5 text-sm leading-7 text-[var(--ink-soft)]">
            Loading generated images...
          </div>
        ) : images.length ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {images.map((image) => (
              <article
                key={image.id}
                className="overflow-hidden rounded-[28px] border border-[var(--line-soft)] bg-[var(--surface-subtle)]"
              >
                <Image
                  src={image.imageURL}
                  alt={image.sceneKey}
                  width={1200}
                  height={1600}
                  sizes="(min-width: 1280px) 30vw, (min-width: 768px) 46vw, 92vw"
                  className="aspect-[4/5] h-auto w-full object-cover"
                />
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">
                    {image.sceneKey.replaceAll("_", " ")}
                  </p>
                  <p className="mt-2 text-sm text-[var(--ink-soft)]">
                    Saved to your private output library.
                  </p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <a
                      href={image.imageURL}
                      download={`placeme-${image.sceneKey}`}
                      className="premium-pressable premium-action inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                    <button
                      type="button"
                      onClick={() => void handleDeleteImage(image.id)}
                      disabled={busyImageId === image.id}
                      className="premium-pressable premium-danger-action inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold"
                    >
                      <Trash2 className="h-4 w-4" />
                      {busyImageId === image.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
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
