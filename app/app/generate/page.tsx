"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Images,
  MapPinned,
  PencilLine,
  Search,
  Sparkles,
  Users2,
  WandSparkles,
} from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { PageHero } from "@/components/page-hero";
import { useAuth } from "@/hooks/use-auth";
import { useProfiles } from "@/hooks/use-profiles";
import {
  DESTINATIONS,
  IMAGE_COUNT_OPTIONS,
  OCCASION_OPTIONS,
  TRAVEL_STYLES,
  getDestinationLabel,
  getOccasionLabel,
  getRelationshipLabel,
  getStyleLabel,
} from "@/lib/constants";
import { getReadinessSummary } from "@/lib/readiness";
import { createGenerationJob } from "@/services/job-service";
import type {
  DestinationKey,
  DestinationOption,
  ImageCount,
  OccasionKey,
  Profile,
  TravelStyleKey,
} from "@/types/domain";

const TOTAL_STEPS = 5;

const ScenePackPreview = dynamic(
  () =>
    import("@/components/scene-pack-preview").then((module) => ({
      default: module.ScenePackPreview,
    })),
  {
    loading: () => (
      <div className="travel-panel rounded-[24px] p-5">
        <p className="text-sm leading-7 text-[var(--ink-soft)]">
          Loading scene sequence...
        </p>
      </div>
    ),
  },
);

const customBriefExamples = [
  "Create Oscar gala red carpet photos, then an elegant backstage portrait and an afterparty arrival.",
  "Make a winter proposal trip in Lapland with northern lights, a glass igloo, and a cozy dinner.",
  "Create a Formula 1 paddock weekend with VIP hospitality, pit lane walk, and evening podium party.",
];

function getProfileReadinessLine(profile: Profile) {
  const summary = getReadinessSummary(profile);
  return `${profile.photoCount} photos, ${summary.coveredItems}/${summary.totalItems} checklist areas`;
}

function OptionButton({
  active,
  disabled = false,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`premium-pressable premium-choice-button min-h-[7.5rem] rounded-[20px] p-4 text-left ${
        active ? "premium-choice-button-active" : ""
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {icon}
          <p className="font-semibold text-[var(--ink-strong)]">{title}</p>
        </div>
        {active ? <CheckCircle2 className="h-5 w-5 text-[var(--accent-sea)]" /> : null}
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{description}</p>
    </button>
  );
}

function StepCard({
  step,
  title,
  summary,
  currentStep,
  onEdit,
  children,
}: {
  step: number;
  title: string;
  summary: string;
  currentStep: number;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  if (step < currentStep) {
    return (
      <button
        type="button"
        onClick={onEdit}
        className="premium-pressable travel-panel flex w-full items-center justify-between gap-4 rounded-[24px] p-4 text-left"
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-sea)]">
            Step {step}/{TOTAL_STEPS}
          </p>
          <p className="mt-1 text-base font-semibold text-[var(--ink-strong)]">
            {title}
          </p>
          <p className="mt-1 truncate text-sm text-[var(--ink-soft)]">
            {summary}
          </p>
        </div>
        <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--accent-sea)]" />
      </button>
    );
  }

  if (step > currentStep) {
    return (
      <section className="travel-panel rounded-[24px] p-4 opacity-70">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
          Step {step}/{TOTAL_STEPS}
        </p>
        <p className="mt-1 text-base font-semibold text-[var(--ink-strong)]">
          {title}
        </p>
      </section>
    );
  }

  return (
    <section className="travel-panel rounded-[24px] p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-sea)]">
        Step {step}/{TOTAL_STEPS}
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--ink-strong)]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ContinueButton({
  onClick,
  disabled = false,
  label = "Continue",
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="premium-pressable premium-action mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-55 sm:w-auto"
    >
      {label}
      <WandSparkles className="h-4 w-4" />
    </button>
  );
}

function DestinationPicker({
  destinations,
  selectedDestination,
  query,
  onQueryChange,
  onSelect,
}: {
  destinations: DestinationOption[];
  selectedDestination: DestinationKey;
  query: string;
  onQueryChange: (value: string) => void;
  onSelect: (value: DestinationKey) => void;
}) {
  const selected = destinations.find(
    (option) => option.value === selectedDestination,
  );
  const normalizedQuery = query.trim().toLowerCase();
  const visibleDestinations = normalizedQuery
    ? destinations.filter(
        (option) =>
          option.label.toLowerCase().includes(normalizedQuery) ||
          option.description.toLowerCase().includes(normalizedQuery),
      )
    : destinations;

  return (
    <div className="mt-5 rounded-[22px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-3 sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-strong)] text-[var(--accent-sea)]">
            <MapPinned className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
              Selected scene pack
            </p>
            <p className="mt-1 truncate text-lg font-semibold text-[var(--ink-strong)]">
              {selected?.label ?? "Choose destination"}
            </p>
          </div>
        </div>

        <label className="relative block w-full lg:max-w-xs">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search scene packs"
            className="w-full rounded-full border border-[var(--line-soft)] bg-white/70 py-3 pl-11 pr-4 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--accent-sea)]"
          />
        </label>
      </div>

      <div className="mt-4 max-h-[24rem] overflow-y-auto pr-1">
        <div className="grid gap-2">
          {visibleDestinations.map((option) => {
            const active = option.value === selectedDestination;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelect(option.value)}
                className={`premium-pressable premium-choice-button rounded-2xl p-4 text-left ${
                  active ? "premium-choice-button-active" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-[var(--ink-strong)]">
                      {option.label}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
                      {option.description}
                    </p>
                  </div>
                  {active ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--accent-sea)]" />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        {!visibleDestinations.length ? (
          <div className="rounded-2xl border border-dashed border-[var(--line-soft)] p-5 text-sm text-[var(--ink-soft)]">
            No scene packs match this search.
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function GeneratePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { profiles, loading, error: profilesError } = useProfiles();
  const [primaryProfileId, setPrimaryProfileId] = useState("");
  const [mode, setMode] = useState<"solo" | "companion">("solo");
  const [companionProfileId, setCompanionProfileId] = useState("");
  const [creationMode, setCreationMode] = useState<"guided" | "custom">("guided");
  const [destination, setDestination] = useState<DestinationKey>("new-york");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [customTravelRequest, setCustomTravelRequest] = useState("");
  const [style, setStyle] = useState<TravelStyleKey>("premium-elegant");
  const [imageCount, setImageCount] = useState<ImageCount>(8);
  const [occasion, setOccasion] = useState<OccasionKey>("none");
  const [currentStep, setCurrentStep] = useState(1);
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
  const effectiveDestination: DestinationKey =
    creationMode === "custom" ? "custom" : destination;
  const selectedDestination = DESTINATIONS.find(
    (option) => option.value === effectiveDestination,
  );
  const guidedDestinations = DESTINATIONS.filter(
    (option) => option.value !== "custom",
  );
  const trimmedBrief = customTravelRequest.trim();
  const hasPetParticipant =
    selectedPrimaryProfile?.relationshipType === "pet" ||
    selectedCompanionProfile?.relationshipType === "pet";
  const selectedOccasion = OCCASION_OPTIONS.find(
    (option) => option.value === occasion,
  );
  const canContinueSubject =
    Boolean(selectedPrimaryProfile) &&
    (effectiveMode === "solo" || Boolean(selectedCompanionProfile));
  const canContinueScene =
    creationMode === "guided" || trimmedBrief.length >= 12;
  const isReadyForScenePreview = currentStep > TOTAL_STEPS;
  const stepSummaries = {
    cast: effectiveMode === "solo" ? "Solo set" : "With companion",
    subject:
      effectiveMode === "solo"
        ? selectedPrimaryProfile?.displayName ?? "Select profile"
        : `${selectedPrimaryProfile?.displayName ?? "Primary"} + ${
            selectedCompanionProfile?.displayName ?? "companion"
          }`,
    scene:
      creationMode === "custom"
        ? trimmedBrief || "Custom brief"
        : getDestinationLabel(effectiveDestination),
    look: `${getStyleLabel(style)} - ${imageCount} images`,
    occasion: selectedOccasion?.label ?? "No special moment",
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user || !selectedPrimaryProfile) {
      return;
    }

    if (effectiveMode === "companion" && !selectedCompanionProfile) {
      setError("Select a ready companion profile before creating a shared set.");
      return;
    }

    if (creationMode === "custom" && trimmedBrief.length < 12) {
      setError("Describe the custom scene in at least one clear sentence.");
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
          destination: effectiveDestination,
          customTravelRequest: trimmedBrief || null,
          style,
          imageCount,
          occasion,
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
    <div className="space-y-6">
      <PageHero
        eyebrow="Generate"
        title="Create the exact scene you want"
        description="Choose profile, scene, style, and image count."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <StepCard
            step={1}
            title="Solo or shared scene"
            summary={stepSummaries.cast}
            currentStep={currentStep}
            onEdit={() => setCurrentStep(1)}
          >

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <OptionButton
                active={effectiveMode === "solo"}
                onClick={() => setMode("solo")}
                icon={<Users2 className="h-5 w-5 text-[var(--accent-sea)]" />}
                title="Solo set"
                description="One profile only."
              />
              <OptionButton
                active={effectiveMode === "companion"}
                disabled={!companionCandidates.length}
                onClick={() => setMode("companion")}
                icon={<Users2 className="h-5 w-5 text-[var(--accent-sea)]" />}
                title="With companion"
                description="Add one ready profile."
              />
            </div>

            {!companionCandidates.length ? (
              <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">
                Add another ready profile to unlock shared scenes.
              </p>
            ) : null}
            <ContinueButton onClick={() => setCurrentStep(2)} />
          </StepCard>

          <StepCard
            step={2}
            title="Who should appear?"
            summary={stepSummaries.subject}
            currentStep={currentStep}
            onEdit={() => setCurrentStep(2)}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <p className="text-sm text-[var(--ink-soft)]">
                {readyProfiles.length} ready profile{readyProfiles.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <p className="text-sm font-semibold text-[var(--ink-strong)]">
                  Primary profile
                </p>
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  {readyProfiles.map((profile) => {
                    const selected = profile.id === effectivePrimaryProfileId;

                    return (
                      <OptionButton
                        key={profile.id}
                        active={selected}
                        onClick={() => setPrimaryProfileId(profile.id)}
                        icon={<Users2 className="h-5 w-5 text-[var(--accent-sea)]" />}
                        title={profile.displayName}
                        description={`${getRelationshipLabel(profile.relationshipType)} - ${getProfileReadinessLine(profile)}`}
                      />
                    );
                  })}
                </div>
              </div>

              {effectiveMode === "companion" ? (
                <div>
                  <p className="text-sm font-semibold text-[var(--ink-strong)]">
                    Companion profile
                  </p>
                  <div className="mt-3 grid gap-3 lg:grid-cols-2">
                    {companionCandidates.map((profile) => (
                      <OptionButton
                        key={profile.id}
                        active={profile.id === effectiveCompanionProfileId}
                        onClick={() => setCompanionProfileId(profile.id)}
                        icon={<Users2 className="h-5 w-5 text-[var(--accent-sand)]" />}
                        title={profile.displayName}
                        description={`${getRelationshipLabel(profile.relationshipType)} - ${getProfileReadinessLine(profile)}`}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
            <ContinueButton
              onClick={() => setCurrentStep(3)}
              disabled={!canContinueSubject}
            />
          </StepCard>

          <StepCard
            step={3}
            title="Scene direction"
            summary={stepSummaries.scene}
            currentStep={currentStep}
            onEdit={() => setCurrentStep(3)}
          >
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <OptionButton
                active={creationMode === "guided"}
                onClick={() => setCreationMode("guided")}
                icon={<MapPinned className="h-5 w-5 text-[var(--accent-sea)]" />}
                title="Guided destination"
                description="Use a ready scene pack."
              />
              <OptionButton
                active={creationMode === "custom"}
                onClick={() => setCreationMode("custom")}
                icon={<PencilLine className="h-5 w-5 text-[var(--accent-sand)]" />}
                title="Write my own"
                description="Describe any trip or event."
              />
            </div>

            {creationMode === "guided" ? (
              <DestinationPicker
                destinations={guidedDestinations}
                selectedDestination={destination}
                query={destinationQuery}
                onQueryChange={setDestinationQuery}
                onSelect={setDestination}
              />
            ) : (
              <div className="mt-5 space-y-4">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-[var(--ink-strong)]">
                    Custom travel or event request
                  </span>
                  <textarea
                    rows={5}
                    value={customTravelRequest}
                    onChange={(event) => setCustomTravelRequest(event.target.value)}
                    placeholder="For example: Create Oscar gala red carpet photos with an arrival, press line, backstage portrait, and afterparty scene."
                    className="min-h-[9rem] rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-subtle)] px-4 py-3 text-sm leading-7 text-[var(--ink-strong)] outline-none focus:border-[var(--accent-sea)]"
                  />
                </label>
                <div className="grid gap-2">
                  {customBriefExamples.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => setCustomTravelRequest(example)}
                      className="premium-pressable premium-ghost-action rounded-full px-4 py-2 text-left text-sm font-medium"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {creationMode === "guided" ? (
              <label className="mt-5 grid gap-2">
                <span className="text-sm font-semibold text-[var(--ink-strong)]">
                  Optional extra direction
                </span>
                <textarea
                  rows={3}
                  value={customTravelRequest}
                  onChange={(event) => setCustomTravelRequest(event.target.value)}
                  placeholder="Add details like a specific hotel lobby, birthday dinner, pet-friendly cafe, or red-carpet tone."
                  className="rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-subtle)] px-4 py-3 text-sm leading-7 text-[var(--ink-strong)] outline-none focus:border-[var(--accent-sea)]"
                />
              </label>
            ) : null}
            <ContinueButton
              onClick={() => setCurrentStep(4)}
              disabled={!canContinueScene}
            />
          </StepCard>

          <StepCard
            step={4}
            title="Look and output"
            summary={stepSummaries.look}
            currentStep={currentStep}
            onEdit={() => setCurrentStep(4)}
          >
            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {TRAVEL_STYLES.map((option) => (
                <OptionButton
                  key={option.value}
                  active={style === option.value}
                  onClick={() => setStyle(option.value)}
                  icon={<Sparkles className="h-5 w-5 text-[var(--accent-sand)]" />}
                  title={option.label}
                  description={option.description}
                />
              ))}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {IMAGE_COUNT_OPTIONS.map((option) => (
                <OptionButton
                  key={option}
                  active={imageCount === option}
                  onClick={() => setImageCount(option)}
                  icon={<Images className="h-5 w-5 text-[var(--accent-sea)]" />}
                  title={`${option} images`}
                  description={
                    option === 2
                      ? "Low-cost test run."
                      : option === 8
                        ? "Fast review set."
                        : option === 10
                          ? "Balanced variety."
                          : "Broadest comparison."
                  }
                />
              ))}
            </div>
            <ContinueButton onClick={() => setCurrentStep(5)} />
          </StepCard>

          <StepCard
            step={5}
            title="Season or event"
            summary={stepSummaries.occasion}
            currentStep={currentStep}
            onEdit={() => setCurrentStep(5)}
          >
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {OCCASION_OPTIONS.map((option) => (
                <OptionButton
                  key={option.value}
                  active={occasion === option.value}
                  onClick={() => setOccasion(option.value)}
                  icon={<CalendarDays className="h-5 w-5 text-[var(--accent-sea)]" />}
                  title={option.label}
                  description={option.description}
                />
              ))}
            </div>

            <ContinueButton
              onClick={() => setCurrentStep(TOTAL_STEPS + 1)}
              label="Review scene pack"
            />
          </StepCard>

          {isReadyForScenePreview ? (
            <section className="travel-panel rounded-[24px] p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-sea)]">
                Ready
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--ink-strong)]">
                Review and create
              </h2>

              {error ? (
                <div className="mt-5 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="premium-pressable premium-action mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-semibold disabled:opacity-60"
              >
                <WandSparkles className="h-4 w-4" />
                {submitting ? "Creating set..." : "Create photo set"}
              </button>
            </section>
          ) : null}
        </form>

        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <section className="travel-panel rounded-[24px] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-sea)]">
              Job summary
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--ink-strong)]">
              {selectedDestination?.label} set
            </h2>

            <div className="mt-5 space-y-3">
              {[
                ["Primary", selectedPrimaryProfile?.displayName ?? "Select profile"],
                [
                  "Companion",
                  effectiveMode === "solo"
                    ? "Solo"
                    : selectedCompanionProfile?.displayName ?? "Select companion",
                ],
                ["Scene", creationMode === "custom" ? "Custom brief" : getDestinationLabel(effectiveDestination)],
                ["Style", getStyleLabel(style)],
                ["Output", `${imageCount} images`],
                ["Moment", getOccasionLabel(occasion)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-4 border-b border-[var(--line-soft)] pb-3 last:border-b-0 last:pb-0"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                    {label}
                  </p>
                  <p className="text-right text-sm font-semibold text-[var(--ink-strong)]">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {trimmedBrief ? (
              <div className="mt-5 rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                  Brief
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                  {trimmedBrief}
                </p>
              </div>
            ) : null}
          </section>

          <section className="travel-panel rounded-[24px] p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-[var(--accent-sand)]" />
              <div>
                <p className="font-semibold text-[var(--ink-strong)]">
                  Reference match
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                  Keep face, proportions, hair, skin tone, and signature details close to the references.
                </p>
                {hasPetParticipant ? (
                  <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                    For pets, preserve breed, markings, paws, tail, neck, collar, and harness.
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          {isReadyForScenePreview ? (
            <ScenePackPreview destination={effectiveDestination} imageCount={imageCount} />
          ) : null}
        </aside>
      </div>
    </div>
  );
}
