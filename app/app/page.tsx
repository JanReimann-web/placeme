"use client";

import Link from "next/link";
import {
  Camera,
  FolderOpen,
  Globe,
  ImageIcon,
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
      className={`premium-pressable travel-panel group rounded-[30px] border border-[rgba(214,193,156,0.68)] bg-white/84 p-5 shadow-[0_22px_44px_rgba(77,58,30,0.08)] hover:bg-white sm:rounded-[34px] sm:p-7 ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(124,82,219,0.18)] bg-[linear-gradient(180deg,rgba(214,194,255,0.44),rgba(170,130,246,0.22))] text-[var(--surface-dark)] shadow-[0_12px_24px_rgba(87,40,158,0.08)] sm:h-16 sm:w-16">
        {icon}
      </div>
      <h2 className="mt-6 text-[1.7rem] font-semibold tracking-[-0.04em] text-[var(--ink-strong)] sm:mt-8 sm:text-[2rem]">
        {title}
      </h2>
      <p className="mt-2 text-base leading-7 text-[var(--ink-soft)] sm:text-[1.15rem] sm:leading-8">
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

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="travel-panel rounded-[30px] border border-[rgba(215,196,162,0.72)] bg-white/86 px-5 py-6 shadow-[0_24px_54px_rgba(77,58,30,0.08)] sm:rounded-[36px] sm:px-8 sm:py-8 md:px-10 md:py-10">
        <div className="max-w-4xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--ink-muted)] sm:text-sm">
            Private studio
          </p>
          <h1 className="display-type mt-5 text-[3.15rem] leading-[0.92] tracking-[-0.05em] text-[var(--ink-strong)] sm:mt-6 sm:text-[5.4rem] lg:text-[6.6rem]">
            Hello, {firstName}!
          </h1>

          <Link
            href="/app/generate"
            className="premium-pressable premium-action mt-7 inline-flex w-full items-center justify-center gap-3 rounded-full px-5 py-4 text-[1.05rem] font-medium tracking-[-0.03em] sm:mt-8 sm:gap-4 sm:px-10 sm:py-5 sm:text-[1.35rem] sm:w-auto sm:min-w-[26rem]"
          >
            <Camera className="h-5 w-5 sm:h-7 sm:w-7" />
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

      {!jobsLoading && !jobs.length ? (
        <EmptyState
          title="Your first travel set will show up here"
          description="Create a profile, then generate a destination photo set to start reviewing outputs."
          actionHref="/app/generate"
          actionLabel="Open generate"
        />
      ) : null}
    </div>
  );
}
