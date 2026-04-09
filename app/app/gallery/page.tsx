"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { useGeneratedGallery, useJobs } from "@/hooks/use-jobs";
import { useProfiles } from "@/hooks/use-profiles";
import { DESTINATIONS, TRAVEL_STYLES } from "@/lib/constants";

export default function GalleryPage() {
  const { jobs, error: jobsError } = useJobs();
  const {
    images,
    loading: imagesLoading,
    error: imagesError,
  } = useGeneratedGallery();
  const { profiles, error: profilesError } = useProfiles();
  const [destinationFilter, setDestinationFilter] = useState("all");
  const [styleFilter, setStyleFilter] = useState("all");
  const [profileFilter, setProfileFilter] = useState("all");
  const [companionFilter, setCompanionFilter] = useState("all");
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const completedJobs = useMemo(
    () => jobs.filter((job) => job.status === "completed"),
    [jobs],
  );
  const jobsById = useMemo(
    () => new Map(completedJobs.map((job) => [job.id, job])),
    [completedJobs],
  );

  const galleryItems = useMemo(
    () =>
      images
        .map((image) => ({
          image,
          job: jobsById.get(image.jobId) ?? null,
        }))
        .filter((item) => item.job !== null),
    [images, jobsById],
  );

  const filteredItems = useMemo(
    () =>
      galleryItems.filter(({ job }) => {
        if (!job) {
          return false;
        }

        if (destinationFilter !== "all" && job.destination !== destinationFilter) {
          return false;
        }

        if (styleFilter !== "all" && job.style !== styleFilter) {
          return false;
        }

        if (profileFilter !== "all" && job.primaryProfileId !== profileFilter) {
          return false;
        }

        if (
          companionFilter !== "all" &&
          (job.companionProfileId ?? "none") !== companionFilter
        ) {
          return false;
        }

        return true;
      }),
    [companionFilter, destinationFilter, galleryItems, profileFilter, styleFilter],
  );

  const selectedItem =
    filteredItems.find((item) => item.image.id === selectedImageId) ?? null;

  if (
    (jobsError && !jobs.length) ||
    (imagesError && !images.length) ||
    (profilesError && !profiles.length)
  ) {
    return (
      <ErrorState
        title="The gallery could not be assembled"
        description={jobsError ?? imagesError ?? profilesError ?? "Unknown loading error."}
        actionHref="/app/jobs"
        actionLabel="Open jobs"
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="travel-panel rounded-[30px] p-5 sm:rounded-[36px] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-sea)]">
          Gallery
        </p>
        <h1 className="mt-3 text-[2.35rem] font-semibold tracking-[-0.04em] text-[var(--ink-strong)] sm:mt-4 sm:text-4xl">
          Completed output library
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--ink-soft)]">
          Browse finished travel images by destination, styling, and companion mix to
          compare which sets feel the most believable and consistent.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4 sm:gap-4">
          <select
            value={destinationFilter}
            onChange={(event) => setDestinationFilter(event.target.value)}
            className="rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-subtle)] px-4 py-3 text-sm text-[var(--ink-strong)]"
          >
            <option value="all">All destinations</option>
            {DESTINATIONS.map((destination) => (
              <option key={destination.value} value={destination.value}>
                {destination.label}
              </option>
            ))}
          </select>
          <select
            value={styleFilter}
            onChange={(event) => setStyleFilter(event.target.value)}
            className="rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-subtle)] px-4 py-3 text-sm text-[var(--ink-strong)]"
          >
            <option value="all">All styles</option>
            {TRAVEL_STYLES.map((style) => (
              <option key={style.value} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
          <select
            value={profileFilter}
            onChange={(event) => setProfileFilter(event.target.value)}
            className="rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-subtle)] px-4 py-3 text-sm text-[var(--ink-strong)]"
          >
            <option value="all">All primary profiles</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.displayName}
              </option>
            ))}
          </select>
          <select
            value={companionFilter}
            onChange={(event) => setCompanionFilter(event.target.value)}
            className="rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-subtle)] px-4 py-3 text-sm text-[var(--ink-strong)]"
          >
            <option value="all">All companions</option>
            <option value="none">Solo only</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.displayName}
              </option>
            ))}
          </select>
        </div>
      </section>

      {imagesLoading && !images.length ? (
        <section className="travel-panel rounded-[30px] p-5 sm:rounded-[36px] sm:p-8">
          <p className="text-sm leading-7 text-[var(--ink-soft)]">
            Loading completed images...
          </p>
        </section>
      ) : filteredItems.length ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map(({ image, job }) =>
            job ? (
              <button
                key={image.id}
                type="button"
                onClick={() => setSelectedImageId(image.id)}
                className="premium-pressable overflow-hidden rounded-[28px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] text-left shadow-[var(--shadow-card)]"
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
                    {job.primaryProfileName}
                    {job.companionProfileName ? ` + ${job.companionProfileName}` : ""}
                  </p>
                  <p className="mt-2 text-base font-semibold text-[var(--ink-strong)] sm:text-lg">
                    {job.destination.replaceAll("-", " ")}
                  </p>
                  <p className="mt-2 text-sm text-[var(--ink-soft)]">
                    {image.sceneKey.replaceAll("_", " ")}
                  </p>
                </div>
              </button>
            ) : null,
          )}
        </section>
      ) : (
        <EmptyState
          title="No gallery results yet"
          description="Completed outputs will appear here once a generation job finishes."
          actionHref="/app/generate"
          actionLabel="Start travel photo set"
        />
      )}

      {selectedItem?.job ? (
        <div
          className="fixed inset-0 z-[260] overflow-y-auto bg-[rgba(24,14,44,0.58)] p-3 pb-[calc(8rem+env(safe-area-inset-bottom))] backdrop-blur-md sm:p-4"
          onClick={() => setSelectedImageId(null)}
        >
          <div className="mx-auto flex min-h-full max-w-5xl items-start justify-center py-2 sm:items-center sm:py-0">
            <div
              role="dialog"
              aria-modal="true"
              className="travel-panel relative mb-[calc(6.5rem+env(safe-area-inset-bottom))] grid max-h-[calc(100vh-8.75rem-env(safe-area-inset-bottom))] w-full max-w-[24rem] gap-4 overflow-auto rounded-[28px] p-4 pt-16 sm:mb-0 sm:max-h-[calc(100vh-2rem)] sm:max-w-3xl sm:gap-5 sm:rounded-[36px] sm:p-6 sm:pt-16 lg:max-w-5xl lg:grid-cols-[1.1fr_0.9fr]"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedImageId(null)}
                aria-label="Close image detail"
                className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--surface-dark)] text-[var(--surface-base)] shadow-[0_18px_34px_rgba(45,20,92,0.28)] transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] sm:right-5 sm:top-5"
              >
                <X className="h-5 w-5" />
              </button>

              <Image
                src={selectedItem.image.imageURL}
                alt={selectedItem.image.sceneKey}
                width={1200}
                height={1600}
                priority
                sizes="(min-width: 1024px) 55vw, 92vw"
                className="max-h-[54vh] w-full rounded-[28px] object-cover sm:max-h-none"
              />

              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--accent-sea)]">
                    Image detail
                  </p>
                  <h2 className="mt-4 text-[2rem] font-semibold tracking-[-0.03em] text-[var(--ink-strong)] sm:text-3xl">
                    {selectedItem.image.sceneKey.replaceAll("_", " ")}
                  </h2>
                  <p className="mt-4 text-sm leading-8 text-[var(--ink-soft)]">
                    {`${selectedItem.job.primaryProfileName}${
                      selectedItem.job.companionProfileName
                        ? ` with ${selectedItem.job.companionProfileName}`
                        : ""
                    } - ${selectedItem.job.destination.replaceAll("-", " ")} - ${selectedItem.job.style.replaceAll("-", " ")}`}
                  </p>
                </div>

                <a
                  href={selectedItem.image.imageURL}
                  download={`placeme-${selectedItem.image.sceneKey}`}
                  className="premium-pressable premium-action inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold sm:w-auto"
                >
                  Download image
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
