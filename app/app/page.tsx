"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Camera } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { useAuth } from "@/hooks/use-auth";
import { useGeneratedGallery, useJobs } from "@/hooks/use-jobs";
import { useProfiles } from "@/hooks/use-profiles";
import { getDestinationLabel, getStyleLabel } from "@/lib/constants";
import { formatCompactDate } from "@/lib/format";
import type { GeneratedImage } from "@/types/domain";

const THUMBNAIL_ROTATION_MS = 4400;
const THUMBNAIL_FADE_MS = 520;
const THUMBNAIL_STAGGER_MS = 1300;

function getFirstName(name?: string | null) {
  if (!name) {
    return "there";
  }

  return name.trim().split(/\s+/)[0] ?? "there";
}

function ActivityJobThumbnail({
  images,
  alt,
  slotIndex,
}: {
  images: GeneratedImage[];
  alt: string;
  slotIndex: number;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (images.length <= 1) {
      return;
    }

    let fadeTimeoutId: number | null = null;
    let rotationTimeoutId: number | null = null;

    const rotateThumbnail = () => {
      setVisible(false);

      fadeTimeoutId = window.setTimeout(() => {
        setActiveIndex((currentIndex) => (currentIndex + 1) % images.length);
        setVisible(true);
        rotationTimeoutId = window.setTimeout(
          rotateThumbnail,
          THUMBNAIL_ROTATION_MS,
        );
      }, THUMBNAIL_FADE_MS);
    };

    rotationTimeoutId = window.setTimeout(
      rotateThumbnail,
      THUMBNAIL_ROTATION_MS + slotIndex * THUMBNAIL_STAGGER_MS,
    );

    return () => {
      if (fadeTimeoutId !== null) {
        window.clearTimeout(fadeTimeoutId);
      }

      if (rotationTimeoutId !== null) {
        window.clearTimeout(rotationTimeoutId);
      }
    };
  }, [images.length, slotIndex]);

  const thumbnail = images[activeIndex % images.length] ?? null;

  return (
    <div className="relative h-[5.25rem] w-[5.25rem] shrink-0 overflow-hidden rounded-[22px] border border-white/70 bg-[var(--surface-subtle)] shadow-[0_12px_28px_rgba(92,61,150,0.16)]">
      {thumbnail ? (
        <Image
          src={thumbnail.imageURL}
          alt={alt}
          fill
          sizes="84px"
          className={`object-cover transition-opacity duration-500 ease-out ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : null}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { profiles, error: profilesError } = useProfiles();
  const { jobs, error: jobsError } = useJobs();
  const { images } = useGeneratedGallery();

  const firstName = getFirstName(user?.displayName);
  const readyProfiles = profiles.filter((profile) => profile.readinessStatus === "ready");
  const completedJobs = jobs.filter((job) => job.status === "completed");
  const activeJob =
    jobs.find((job) => job.status === "processing") ??
    jobs.find((job) => job.status === "pending");
  const recentJobs = useMemo(() => jobs.slice(0, 3), [jobs]);
  const recentCompletedJobIds = useMemo(
    () =>
      new Set(
        recentJobs
          .filter((job) => job.status === "completed")
          .map((job) => job.id),
      ),
    [recentJobs],
  );
  const imagesByRecentJob = useMemo(() => {
    const nextImagesByJob = new Map<string, GeneratedImage[]>();

    images.forEach((image) => {
      if (!recentCompletedJobIds.has(image.jobId)) {
        return;
      }

      const jobImages = nextImagesByJob.get(image.jobId) ?? [];
      jobImages.push(image);
      nextImagesByJob.set(image.jobId, jobImages);
    });

    return nextImagesByJob;
  }, [images, recentCompletedJobIds]);

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
            className="premium-pressable premium-action inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold sm:w-auto"
          >
            View all jobs
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {recentJobs.length ? (
          <div className="mt-5 divide-y divide-[var(--line-soft)]">
            {recentJobs.map((job, jobIndex) => {
              const jobImages = imagesByRecentJob.get(job.id) ?? [];
              const shouldShowThumbnailSlot = job.status === "completed";

              return (
                <Link
                  key={job.id}
                  href={`/app/jobs/${job.id}`}
                  className="premium-pressable grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-1 py-4"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--ink-strong)]">
                      {getDestinationLabel(job.destination)} - {getStyleLabel(job.style)}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
                      {job.customTravelRequest ??
                        `${job.primaryProfileName}${job.companionProfileName ? ` + ${job.companionProfileName}` : ""}`}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="rounded-full border border-[var(--line-soft)] bg-[var(--surface-subtle)] px-3 py-1 text-xs font-semibold text-[var(--ink-soft)]">
                        {job.status}
                      </span>
                      <span className="text-sm text-[var(--ink-muted)]">
                        {formatCompactDate(job.createdAt)}
                      </span>
                    </div>
                  </div>

                  {shouldShowThumbnailSlot ? (
                    <ActivityJobThumbnail
                      images={jobImages}
                      alt={`${getDestinationLabel(job.destination)} generated preview`}
                      slotIndex={jobIndex}
                    />
                  ) : null}
                </Link>
              );
            })}
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
