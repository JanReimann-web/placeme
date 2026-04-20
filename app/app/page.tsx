"use client";

import Link from "next/link";
import {
  ArrowRight,
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
  eyebrow,
  title,
  description,
  chips,
  footer,
  rotate,
  shift,
  highlight,
  zIndex,
}: {
  href: string;
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  chips: string[];
  footer: string;
  rotate: string;
  shift: string;
  highlight: string;
  zIndex: number;
}) {
  return (
    <Link
      href={href}
      role="listitem"
      style={
        {
          "--overview-card-rotate": rotate,
          "--overview-card-shift": shift,
          "--overview-card-highlight": highlight,
          zIndex,
        } as React.CSSProperties
      }
      className="home-overview-card premium-pressable group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="home-overview-card-icon">{icon}</div>
        <div className="inline-flex items-center gap-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--surface-dark)]">
          Open
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>

      <div className="mt-8">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[var(--surface-dark)]">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-[var(--ink-strong)] sm:text-[2.3rem]">
          {title}
        </h2>
      </div>

      <p className="mt-3 max-w-[15rem] text-[0.98rem] leading-7 text-[var(--ink-soft)] sm:text-[1.05rem]">
        {description}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span key={chip} className="home-overview-card-chip">
            {chip}
          </span>
        ))}
      </div>

      <p className="mt-auto pt-6 text-sm leading-6 text-[var(--ink-soft)]">
        {footer}
      </p>

      <div className="mt-5 h-px w-full bg-[linear-gradient(90deg,rgba(87,40,158,0.18),rgba(87,40,158,0))]" />
      <p className="mt-4 text-sm font-medium tracking-[-0.02em] text-[var(--ink-strong)]">
        Tap to open this studio lane
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
  const photoCountLabel = `${totalPhotos} photo${totalPhotos === 1 ? "" : "s"} ready`;
  const completedCountLabel = `${completedJobs.length} set${completedJobs.length === 1 ? "" : "s"} finished`;
  const profileChips = profilesLoading
    ? ["Refreshing", "Portrait angles"]
    : totalPhotos
      ? [photoCountLabel, profileCountLabel]
      : ["Start with 8+ photos", "Profile training"];
  const creationChips = jobsLoading
    ? ["Checking queue", "Share-ready"]
    : completedJobs.length
      ? [completedCountLabel, "Latest outputs"]
      : ["First set pending", "Rendering soon"];
  const overviewCards = [
    {
      href: "/app/profiles",
      icon: <FolderOpen className="h-8 w-8" />,
      eyebrow: "Curate",
      title: "Profile Library",
      description: profilesLoading
        ? "Syncing your photo library for cleaner profile training."
        : totalPhotos
          ? `Keep ${photoCountLabel} organized across ${profileCountLabel}.`
          : "Build your first profile with a fuller photo set before you generate.",
      chips: profileChips,
      footer: "Best results come from a richer photo set with multiple clear angles for each traveler.",
      rotate: "-6deg",
      shift: "0.8rem",
      highlight: "rgba(185, 149, 255, 0.32)",
    },
    {
      href: "/app/generate",
      icon: <Globe className="h-8 w-8" />,
      eyebrow: "Explore",
      title: "Scene Packs",
      description: "Slide between curated destinations and drop your profile into each world faster.",
      chips: ["Paris", "Tokyo", "New York", "Dubai"],
      footer: "Premium scene packs keep the look polished without rebuilding the whole prompt flow.",
      rotate: "-1.5deg",
      shift: "0.3rem",
      highlight: "rgba(154, 203, 255, 0.24)",
    },
    {
      href: "/app/gallery",
      icon: <ImageIcon className="h-8 w-8" />,
      eyebrow: "Review",
      title: "Recent Creations",
      description: jobsLoading
        ? "Checking the latest finished travel sets from your studio."
        : completedJobs.length
          ? `Jump back into ${completedCountLabel} and choose the shots worth sharing.`
          : "Your finished travel sets will stack up here as soon as the first one lands.",
      chips: creationChips,
      footer: "Reopen the freshest renders, compare destinations, and keep the strongest shots moving.",
      rotate: "4deg",
      shift: "1rem",
      highlight: "rgba(255, 192, 228, 0.22)",
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="travel-panel max-w-[43rem] rounded-[30px] border border-[rgba(215,196,162,0.72)] bg-white/86 px-5 py-5 shadow-[0_24px_54px_rgba(77,58,30,0.08)] sm:rounded-[36px] sm:px-8 sm:py-7 md:px-10 md:py-8">
        <div className="max-w-[28rem]">
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
              Studio Deck
            </p>
            <h2 className="mt-2 text-[1.85rem] font-semibold tracking-[-0.05em] text-[var(--ink-strong)] sm:text-[2.1rem]">
              Swipe your next move
            </h2>
          </div>
          <span className="rounded-full border border-[rgba(108,60,230,0.12)] bg-white/60 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">
            Swipe
          </span>
        </div>

        <div className="home-overview-deck no-scrollbar" aria-label="Studio shortcuts" role="list">
          {overviewCards.map((card, index) => (
            <OverviewCard
              key={card.title}
              href={card.href}
              icon={card.icon}
              eyebrow={card.eyebrow}
              title={card.title}
              description={card.description}
              chips={card.chips}
              footer={card.footer}
              rotate={card.rotate}
              shift={card.shift}
              highlight={card.highlight}
              zIndex={index + 1}
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
