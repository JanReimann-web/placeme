"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { ScenePackPreview } from "@/components/scene-pack-preview";
import { useAuth } from "@/hooks/use-auth";
import { useProfiles } from "@/hooks/use-profiles";
import { DESTINATIONS, IMAGE_COUNT_OPTIONS, TRAVEL_STYLES } from "@/lib/constants";
import { createGenerationJob } from "@/services/job-service";
import type { DestinationKey, TravelStyleKey } from "@/types/domain";

export default function GeneratePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { profiles, loading } = useProfiles();
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
  const companionCandidates = useMemo(
    () =>
      readyProfiles.filter((profile) => profile.id !== effectivePrimaryProfileId),
    [effectivePrimaryProfileId, readyProfiles],
  );
  const effectiveCompanionProfileId = companionCandidates.some(
    (profile) => profile.id === companionProfileId,
  )
    ? companionProfileId
    : "";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    const primaryProfile = readyProfiles.find(
      (profile) => profile.id === effectivePrimaryProfileId,
    );
    const companionProfile =
      mode === "companion"
        ? companionCandidates.find(
            (profile) => profile.id === effectiveCompanionProfileId,
          ) ?? null
        : null;

    if (!primaryProfile) {
      setError("Select a ready primary profile before generating.");
      return;
    }

    if (mode === "companion" && !companionProfile) {
      setError("Select a ready companion profile.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const jobId = await createGenerationJob({
        userId: user.uid,
        input: {
          primaryProfileId: primaryProfile.id,
          primaryProfileName: primaryProfile.displayName,
          mode,
          companionProfileId: companionProfile?.id ?? null,
          companionProfileName: companionProfile?.displayName ?? null,
          destination,
          style,
          imageCount,
        },
        primaryProfile,
        companionProfile,
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
    <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <form onSubmit={handleSubmit} className="travel-panel rounded-[36px] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-sea)]">
          New generation job
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-[var(--ink-strong)]">
          Start a controlled destination set
        </h1>
        <p className="mt-4 text-sm leading-8 text-[var(--ink-soft)]">
          The current MVP uses a deterministic mock provider with the same scene and job architecture that the Gemini backend will later consume.
        </p>

        <div className="mt-8 grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[var(--ink-strong)]">
              Primary profile
            </span>
            <select
              value={effectivePrimaryProfileId}
              onChange={(event) => setPrimaryProfileId(event.target.value)}
              className="rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-subtle)] px-4 py-3 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--accent-sea)]"
            >
              {readyProfiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.displayName}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-2">
            <span className="text-sm font-semibold text-[var(--ink-strong)]">
              Mode
            </span>
            <div className="grid grid-cols-2 gap-3">
              {(["solo", "companion"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value)}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                    mode === value
                      ? "bg-[var(--surface-dark)] text-[var(--surface-base)]"
                      : "border border-[var(--line-soft)] text-[var(--ink-soft)]"
                  }`}
                >
                  {value === "solo" ? "Solo" : "With companion"}
                </button>
              ))}
            </div>
          </div>

          {mode === "companion" ? (
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-[var(--ink-strong)]">
                Companion profile
              </span>
              <select
                value={effectiveCompanionProfileId}
                onChange={(event) => setCompanionProfileId(event.target.value)}
                className="rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-subtle)] px-4 py-3 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--accent-sea)]"
              >
                <option value="">Select a companion</option>
                {companionCandidates.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.displayName}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[var(--ink-strong)]">
              Destination
            </span>
            <select
              value={destination}
              onChange={(event) => setDestination(event.target.value as DestinationKey)}
              className="rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-subtle)] px-4 py-3 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--accent-sea)]"
            >
              {DESTINATIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[var(--ink-strong)]">
              Style
            </span>
            <select
              value={style}
              onChange={(event) => setStyle(event.target.value as TravelStyleKey)}
              className="rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-subtle)] px-4 py-3 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--accent-sea)]"
            >
              {TRAVEL_STYLES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[var(--ink-strong)]">
              Image count
            </span>
            <select
              value={imageCount}
              onChange={(event) =>
                setImageCount(Number(event.target.value) as 8 | 10 | 12)
              }
              className="rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-subtle)] px-4 py-3 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--accent-sea)]"
            >
              {IMAGE_COUNT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-8 rounded-full bg-[var(--surface-dark)] px-5 py-3 text-sm font-semibold text-[var(--surface-base)] disabled:opacity-60"
        >
          {submitting ? "Creating job..." : "Create generation job"}
        </button>
      </form>

      <ScenePackPreview destination={destination} imageCount={imageCount} />
    </div>
  );
}
