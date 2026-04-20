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
  indexLabel,
  icon,
  eyebrow,
  title,
  description,
  chips,
  note,
  accent,
}: {
  href: string;
  indexLabel: string;
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  chips: string[];
  note: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      role="listitem"
      style={
        {
          "--studio-card-accent": accent,
        } as React.CSSProperties
      }
      className="studio-spotlight-card premium-pressable group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="studio-spotlight-card__icon">{icon}</div>
        <span className="studio-spotlight-card__index">{indexLabel}</span>
      </div>

      <div className="mt-7">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[var(--surface-dark)]">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-[1.7rem] font-semibold tracking-[-0.05em] text-[var(--ink-strong)] sm:text-[1.95rem]">
          {title}
        </h2>
      </div>

      <p className="mt-3 max-w-[15.5rem] text-[0.94rem] leading-6 text-[var(--ink-soft)] sm:text-[1rem]">
        {description}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span key={chip} className="studio-spotlight-card__chip">
            {chip}
          </span>
        ))}
      </div>

      <p className="mt-auto pt-5 text-sm leading-6 text-[var(--ink-soft)]">
        {note}
      </p>

      <div className="mt-4 h-px w-full bg-[linear-gradient(90deg,rgba(87,40,158,0.18),rgba(87,40,158,0))]" />
      <p className="mt-3 text-sm font-medium tracking-[-0.02em] text-[var(--ink-strong)]">
        Swipe, focus, then open
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
  const profileCountLabel = `${profiles.length} profile${profiles.length === 1 ? "" : "s"}`;
  const photoCountLabel = `${totalPhotos} photo${totalPhotos === 1 ? "" : "s"}`;
  const completedCountLabel = `${completedJobs.length} set${completedJobs.length === 1 ? "" : "s"}`;
  const profileChips = profilesLoading
    ? ["Refreshing", "Angles checked"]
    : totalPhotos
      ? [photoCountLabel, profileCountLabel]
      : ["Start with 8+ photos", "Train identity"];
  const creationChips = jobsLoading
    ? ["Checking queue", "Recent outputs"]
    : completedJobs.length
      ? [completedCountLabel, "Ready to review"]
      : ["First set pending", "Rendering soon"];
  const overviewCards = [
    {
      href: "/app/profiles",
      indexLabel: "01",
      icon: <FolderOpen className="h-8 w-8" />,
      eyebrow: "Curate",
      title: "Profile Library",
      description: profilesLoading
        ? "Refreshing the photo base that keeps your travelers consistent."
        : totalPhotos
          ? `Shape the reference set behind every stronger generation.`
          : "Build your first traveler with a fuller photo set before you generate.",
      chips: profileChips,
      note: "This is the quality layer the rest of the app depends on.",
      accent: "rgba(185, 149, 255, 0.28)",
    },
    {
      href: "/app/generate",
      indexLabel: "02",
      icon: <Globe className="h-8 w-8" />,
      eyebrow: "Explore",
      title: "Scene Packs",
      description: "Pick a destination lane and move into a polished travel set with less setup friction.",
      chips: ["Paris", "Tokyo", "New York", "Dubai"],
      note: "Best when you know the mood and want to move straight into generation.",
      accent: "rgba(154, 203, 255, 0.22)",
    },
    {
      href: "/app/gallery",
      indexLabel: "03",
      icon: <ImageIcon className="h-8 w-8" />,
      eyebrow: "Review",
      title: "Recent Creations",
      description: jobsLoading
        ? "Checking the latest finished travel sets from your studio."
        : completedJobs.length
          ? `Reopen ${completedCountLabel} and keep the shots that actually land.`
          : "Your finished travel sets will stack up here as soon as the first one lands.",
      chips: creationChips,
      note: "Stay close to the best results instead of losing them in the queue.",
      accent: "rgba(255, 192, 228, 0.2)",
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="travel-panel max-w-[36rem] rounded-[30px] border border-[rgba(215,196,162,0.72)] bg-white/86 px-5 py-5 shadow-[0_24px_54px_rgba(77,58,30,0.08)] sm:rounded-[36px] sm:px-8 sm:py-7 md:px-9 md:py-8">
        <div className="max-w-[25rem]">
          <h1 className="display-type text-[3.15rem] leading-[0.92] tracking-[-0.05em] text-[var(--ink-strong)] sm:text-[5.2rem] lg:text-[6rem]">
            Hello, {firstName}!
          </h1>

          <Link
            href="/app/generate"
            className="premium-pressable premium-action mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full px-5 py-4 text-[1.05rem] font-medium tracking-[-0.03em] sm:mt-7 sm:w-auto sm:min-w-[24rem] sm:gap-4 sm:px-10 sm:py-5 sm:text-[1.3rem]"
          >
            <Camera className="h-5 w-5 sm:h-7 sm:w-7" />
            Generate New Travel Photo
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[var(--surface-dark)]">
              Studio lanes
            </p>
            <h2 className="mt-2 text-[1.85rem] font-semibold tracking-[-0.05em] text-[var(--ink-strong)] sm:text-[2.1rem]">
              Move one card at a time
            </h2>
          </div>
          <span className="rounded-full border border-[rgba(108,60,230,0.12)] bg-white/60 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">
            3 lanes
          </span>
        </div>

        <div className="studio-spotlight-rail no-scrollbar lg:grid-cols-3" aria-label="Studio shortcuts" role="list">
          {overviewCards.map((card) => (
            <OverviewCard
              key={card.title}
              href={card.href}
              indexLabel={card.indexLabel}
              icon={card.icon}
              eyebrow={card.eyebrow}
              title={card.title}
              description={card.description}
              chips={card.chips}
              note={card.note}
              accent={card.accent}
            />
          ))}
        </div>
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
