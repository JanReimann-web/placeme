"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { RELATIONSHIP_OPTIONS } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";
import { createProfile } from "@/services/profile-service";

const PhotoUploader = dynamic(
  () =>
    import("@/components/photo-uploader").then((module) => ({
      default: module.PhotoUploader,
    })),
  {
    loading: () => (
      <div className="travel-panel rounded-[32px] border border-dashed border-[var(--line-strong)] p-5 sm:p-6">
        <p className="text-sm leading-7 text-[var(--ink-soft)]">
          Loading uploader...
        </p>
      </div>
    ),
  },
);

export default function NewProfilePage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [relationshipType, setRelationshipType] = useState<"self" | "partner" | "child" | "parent" | "friend" | "other">("self");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdProfileId, setCreatedProfileId] = useState<string | null>(null);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const profileId = await createProfile(user.uid, {
        displayName,
        relationshipType,
        notes,
      });
      setCreatedProfileId(profileId);
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : "Profile creation failed.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="travel-panel rounded-[36px] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-sea)]">
          New profile
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-[var(--ink-strong)]">
          Add a person to your travel library
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--ink-soft)]">
          Start with the basics, then add the photo references that will anchor this
          person across future travel sets.
        </p>
      </section>

      {!createdProfileId ? (
        <form onSubmit={handleCreate} className="travel-panel rounded-[36px] p-6 sm:p-8">
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            {[
              "Create the profile record",
              "Upload at least 8 photos",
              "Refine readiness tags",
            ].map((step, index) => (
              <div
                key={step}
                className="rounded-[24px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">
                  Step {index + 1}
                </p>
                <p className="mt-3 text-sm font-semibold text-[var(--ink-strong)]">
                  {step}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-[var(--ink-strong)]">
                Display name
              </span>
              <input
                required
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="For example: Anna"
                className="rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-subtle)] px-4 py-3 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--accent-sea)]"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-[var(--ink-strong)]">
                Relationship type
              </span>
              <select
                value={relationshipType}
                onChange={(event) =>
                  setRelationshipType(
                    event.target.value as typeof relationshipType,
                  )
                }
                className="rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-subtle)] px-4 py-3 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--accent-sea)]"
              >
                {RELATIONSHIP_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-[var(--ink-strong)]">
                Notes
              </span>
              <textarea
                rows={4}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Optional reminders about lighting, angles, or styling."
                className="rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-subtle)] px-4 py-3 text-sm leading-7 text-[var(--ink-strong)] outline-none focus:border-[var(--accent-sea)]"
              />
            </label>
          </div>

          {error ? (
            <div className="mt-5 rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="premium-pressable premium-action rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-60"
            >
              {submitting ? "Creating profile..." : "Create profile"}
            </button>
            <p className="text-sm text-[var(--ink-soft)]">
              Step 1 of 2. You can upload photos immediately after creating the profile.
            </p>
          </div>
        </form>
      ) : (
        <section className="space-y-4">
          <div className="travel-panel rounded-[36px] p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-sea)]">
              Profile created
            </p>
            <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
              Upload the first reference photos now, then continue to the full profile
              view to refine readiness.
            </p>
          </div>

          <PhotoUploader profileId={createdProfileId} />

          <Link
            href={`/app/profiles/${createdProfileId}`}
            className="premium-pressable premium-action inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
          >
            Continue to profile detail
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}
    </div>
  );
}
