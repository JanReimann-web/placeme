"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Images,
  MapPinned,
  Sparkles,
  Users2,
  WandSparkles,
} from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useAuth } from "@/hooks/use-auth";
import { useProfiles } from "@/hooks/use-profiles";
import {
  DESTINATIONS,
  IMAGE_COUNT_OPTIONS,
  TRAVEL_STYLES,
  getDestinationLabel,
  getRelationshipLabel,
  getStyleLabel,
} from "@/lib/constants";
import { getReadinessSummary } from "@/lib/readiness";
import { createGenerationJob } from "@/services/job-service";
import type { DestinationKey, TravelStyleKey } from "@/types/domain";

const ScenePackPreview = dynamic(
  () =>
    import("@/components/scene-pack-preview").then((module) => ({
      default: module.ScenePackPreview,
    })),
  {
    loading: () => (
      <div className="travel-panel rounded-[32px] p-6 sm:p-8">
        <p className="text-sm leading-7 text-[var(--ink-soft)]">
          Loading scene pack preview...
        </p>
      </div>
    ),
  },
);

export default function GeneratePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { profiles, loading, error: profilesError } = useProfiles();
  const [primaryProfileId, setPrimaryProfileId] = useState("");
  const [mode, setMode] = useState<"solo" | "companion">("solo");
  const [companionProfileId, setCompanionProfileId] = useState("");
  const [destination, setDestination] = useState<DestinationKey>("new-york");
  const [style, setStyle] = useState<TravelStyleKey>("casual-travel");
  const [imageCount, setImageCount] = useState<8 | 10 | 12>(8);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readyProfiles = useMemo(
    () => profiles.filter((profile) => profile.readinessStatus === "ready"),
    [profiles],
  );
  const effectivePrimaryProfileId = readyProfiles.some(
    (profile) => profile.id === primaryProfileId,
  )
    ? primaryProfileId
    : readyProfiles[0]?.id ?? "";
  const selectedPrimaryProfile = readyProfiles.find(
    (profile) => profile.id === effectivePrimaryProfileId,
  );
  const companionCandidates = useMemo(
    () =>
      readyProfiles.filter((profile) => profile.id !== effectivePrimaryProfileId),
    [effectivePrimaryProfileId, readyProfiles],
  );
  const effectiveMode =
    mode === "companion" && companionCandidates.length ? "companion" : "solo";
  const effectiveCompanionProfileId = companionCandidates.some(
    (profile) => profile.id === companionProfileId,
  )
    ? companionProfileId
    : "";
  const selectedCompanionProfile = companionCandidates.find(
    (profile) => profile.id === effectiveCompanionProfileId,
  );
  const selectedDestination = DESTINATIONS.find(
    (option) => option.value === destination,
  );
  const selectedStyle = TRAVEL_STYLES.find((option) => option.value === style);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user || !selectedPrimaryProfile) {
      return;
    }

    if (effectiveMode === "companion" && !selectedCompanionProfile) {
      setError("Select a ready companion profile.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const jobId = await createGenerationJob({
        userId: user.uid,
        input: {
          primaryProfileId: selectedPrimaryProfile.id,
          primaryProfileName: selectedPrimaryProfile.displayName,
          mode: effectiveMode,
          companionProfileId: selectedCompanionProfile?.id ?? null,
          companionProfileName: selectedCompanionProfile?.displayName ?? null,
          destination,
          style,
          imageCount,
        },
      });

      router.push(`/app/jobs/${jobId}`);
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : "Job creation failed.",
      );
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading generation setup" />;
  }

  if (profilesError) {
    return (
      <ErrorState
        title="The generation builder could not load profiles"
        description={profilesError}
        actionHref="/app/profiles"
        actionLabel="Open profiles"
      />
    );
  }

  if (!readyProfiles.length) {
    return (
      <EmptyState
        title="No ready profiles available"
        description="Add at least 8 reference photos to a profile before starting a travel photo set."
        actionHref="/app/profiles/new"
        actionLabel="Create or prepare a profile"
      />
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <form
        onSubmit={handleSubmit}
        className="travel-panel rounded-[36px] p-6 sm:p-8"
      >
        <div className="travel-gradient rounded-[28px] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-sea)]">
            Travel set builder
          </p>
          <h1 className="display-type mt-4 text-5xl leading-[0.95] text-[var(--ink-strong)]">
            Compose a premium photo set
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--ink-soft)]">
            Choose who appears in the set, lock the destination mood, and decide how
            many final images you want back. Every scene stays structured so results
            are easier to compare.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">
                Ready travelers
              </p>
              <p className="mt-2 text-2xl font-semibold text-[var(--ink-strong)]">
                {readyProfiles.length}
              </p>
            </div>
            <div className="rounded-[24px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">
                Shared-ready options
              </p>
              <p className="mt-2 text-base font-semibold text-[var(--ink-strong)]">
                {companionCandidates.length}
              </p>
            </div>
            <div className="rounded-[24px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">
                Final image count
              </p>
              <p className="mt-2 text-base font-semibold text-[var(--ink-strong)]">
                {imageCount} images
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[var(--surface-dark)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--surface-base)]">
                Step 1
              </span>
              <p className="text-sm font-semibold text-[var(--ink-strong)]">
                Choose the main traveler
              </p>
            </div>

            <div className="grid gap-3">
              {readyProfiles.map((profile) => {
                const selected = profile.id === effectivePrimaryProfileId;
                const summary = getReadinessSummary(profile);

                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => setPrimaryProfileId(profile.id)}
                    className={`rounded-[24px] border p-4 text-left transition ${
                      selected
                        ? "border-[var(--accent-sea)] bg-[var(--surface-strong)] shadow-[var(--shadow-card)]"
                        : "border-[var(--line-soft)] bg-[var(--surface-subtle)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">
                          {getRelationshipLabel(profile.relationshipType)}
                        </p>
                        <p className="mt-2 text-lg font-semibold text-[var(--ink-strong)]">
                          {profile.displayName}
                        </p>
                      </div>
                      {selected ? (
                        <CheckCircle2 className="h-5 w-5 text-[var(--accent-sea)]" />
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                      {profile.photoCount} photos and {summary.coveredItems}/
                      {summary.totalItems} checklist areas covered.
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[var(--surface-dark)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--surface-base)]">
                Step 2
              </span>
              <p className="text-sm font-semibold text-[var(--ink-strong)]">
                Decide who appears in the set
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {([
                {
                  value: "solo",
                  label: "Solo set",
                  detail: "Keep the whole set focused on one person.",
                },
                {
                  value: "companion",
                  label: "With companion",
                  detail: "Create shared scenes with one additional ready profile.",
                },
              ] as const).map((option) => {
                const active = effectiveMode === option.value;
                const disabled =
                  option.value === "companion" && !companionCandidates.length;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => !disabled && setMode(option.value)}
                    disabled={disabled}
                    className={`rounded-[24px] border p-4 text-left transition ${
                      active
                        ? "border-[var(--accent-sea)] bg-[var(--surface-strong)] shadow-[var(--shadow-card)]"
                        : "border-[var(--line-soft)] bg-[var(--surface-subtle)]"
                    } ${disabled ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <Users2 className="h-5 w-5 text-[var(--accent-sea)]" />
                      <p className="font-semibold text-[var(--ink-strong)]">
                        {option.label}
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                      {option.detail}
                    </p>
                  </button>
                );
              })}
            </div>

            {mode === "companion" ? (
              companionCandidates.length ? (
                <div className="grid gap-3">
                  {companionCandidates.map((profile) => {
                    const selected = profile.id === effectiveCompanionProfileId;

                    return (
                      <button
                        key={profile.id}
                        type="button"
                        onClick={() => setCompanionProfileId(profile.id)}
                        className={`rounded-[24px] border p-4 text-left transition ${
                          selected
                            ? "border-[var(--accent-sea)] bg-[var(--surface-strong)] shadow-[var(--shadow-card)]"
                            : "border-[var(--line-soft)] bg-[var(--surface-subtle)]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">
                              {getRelationshipLabel(profile.relationshipType)}
                            </p>
                            <p className="mt-2 text-lg font-semibold text-[var(--ink-strong)]">
                              {profile.displayName}
                            </p>
                          </div>
                          {selected ? (
                            <CheckCircle2 className="h-5 w-5 text-[var(--accent-sea)]" />
                          ) : null}
                        </div>
                        <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                          {profile.photoCount} ready reference photos available.
                        </p>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                  You need at least one additional ready profile before a shared set can
                  be created.
                </div>
              )
            ) : null}
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[var(--surface-dark)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--surface-base)]">
                Step 3
              </span>
              <p className="text-sm font-semibold text-[var(--ink-strong)]">
                Lock the destination
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {DESTINATIONS.map((option) => {
                const active = destination === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setDestination(option.value)}
                    className={`rounded-[24px] border p-4 text-left transition ${
                      active
                        ? "border-[var(--accent-sea)] bg-[var(--surface-strong)] shadow-[var(--shadow-card)]"
                        : "border-[var(--line-soft)] bg-[var(--surface-subtle)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <MapPinned className="h-5 w-5 text-[var(--accent-sea)]" />
                        <p className="font-semibold text-[var(--ink-strong)]">
                          {option.label}
                        </p>
                      </div>
                      {active ? (
                        <CheckCircle2 className="h-5 w-5 text-[var(--accent-sea)]" />
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[var(--surface-dark)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--surface-base)]">
                Step 4
              </span>
              <p className="text-sm font-semibold text-[var(--ink-strong)]">
                Choose the look and image count
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {TRAVEL_STYLES.map((option) => {
                const active = style === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStyle(option.value)}
                    className={`rounded-[24px] border p-4 text-left transition ${
                      active
                        ? "border-[var(--accent-sea)] bg-[var(--surface-strong)] shadow-[var(--shadow-card)]"
                        : "border-[var(--line-soft)] bg-[var(--surface-subtle)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-[var(--accent-sand)]" />
                        <p className="font-semibold text-[var(--ink-strong)]">
                          {option.label}
                        </p>
                      </div>
                      {active ? (
                        <CheckCircle2 className="h-5 w-5 text-[var(--accent-sea)]" />
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {IMAGE_COUNT_OPTIONS.map((option) => {
                const active = imageCount === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setImageCount(option)}
                    className={`rounded-[24px] border p-4 text-left transition ${
                      active
                        ? "border-[var(--accent-sea)] bg-[var(--surface-strong)] shadow-[var(--shadow-card)]"
                        : "border-[var(--line-soft)] bg-[var(--surface-subtle)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Images className="h-5 w-5 text-[var(--accent-sea)]" />
                        <p className="font-semibold text-[var(--ink-strong)]">
                          {option} images
                        </p>
                      </div>
                      {active ? (
                        <CheckCircle2 className="h-5 w-5 text-[var(--accent-sea)]" />
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                      {option === 8
                        ? "Focused set for a quick review."
                        : option === 10
                          ? "Balanced set with a little more variety."
                          : "Largest set for the broadest comparison."}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="rounded-[24px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">
                Delivery note
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                Smaller sets are faster to review. Larger sets help compare identity
                stability across more scene changes.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-8 rounded-[28px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">
            Job summary
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-[20px] bg-[var(--surface-strong)] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                Primary
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--ink-strong)]">
                {selectedPrimaryProfile?.displayName}
              </p>
            </div>
            <div className="rounded-[20px] bg-[var(--surface-strong)] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                  Companion
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--ink-strong)]">
                  {effectiveMode === "solo"
                    ? "Solo set"
                    : selectedCompanionProfile?.displayName ?? "Select companion"}
                </p>
            </div>
            <div className="rounded-[20px] bg-[var(--surface-strong)] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                Destination
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--ink-strong)]">
                {getDestinationLabel(destination)}
              </p>
            </div>
            <div className="rounded-[20px] bg-[var(--surface-strong)] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                Style
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--ink-strong)]">
                {getStyleLabel(style)}
              </p>
            </div>
            <div className="rounded-[20px] bg-[var(--surface-strong)] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                Image count
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--ink-strong)]">
                {imageCount} final images
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-5 rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--surface-dark)] px-5 py-4 text-sm font-semibold text-[var(--surface-base)] disabled:opacity-60"
        >
          <WandSparkles className="h-4 w-4" />
          {submitting ? "Creating set..." : "Create travel photo set"}
        </button>
      </form>

      <div className="space-y-6">
        <section className="travel-panel rounded-[36px] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-sea)]">
            Selected travel set
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-[var(--ink-strong)]">
            {selectedDestination?.label} {effectiveMode === "solo" ? "solo" : "shared"} set
          </h2>
          <p className="mt-4 text-sm leading-8 text-[var(--ink-soft)]">
            {selectedPrimaryProfile?.displayName}
            {effectiveMode === "companion" && selectedCompanionProfile
              ? ` with ${selectedCompanionProfile.displayName}`
              : ""}
            {" - "}
            {selectedStyle?.label}
            {" - "}
            {imageCount} images
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">
                Destination mood
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                {selectedDestination?.description}
              </p>
            </div>
            <div className="rounded-[24px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">
                Style direction
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                {selectedStyle?.description}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">
              What happens next
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
              PlaceMe creates the job, starts processing in the background, and saves
              each finished scene straight into your private gallery.
            </p>
          </div>
        </section>

        <ScenePackPreview destination={destination} imageCount={imageCount} />
      </div>
    </div>
  );
}
