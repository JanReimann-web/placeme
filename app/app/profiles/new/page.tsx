"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { PhotoUploader } from "@/components/photo-uploader";
import { RELATIONSHIP_OPTIONS } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";
import { createProfile } from "@/services/profile-service";

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
          Start with core identity details, then upload the reference photos that will support future generation consistency.
        </p>
      </section>

      {!createdProfileId ? (
        <form onSubmit={handleCreate} className="travel-panel rounded-[36px] p-6 sm:p-8">
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
                placeholder="Optional notes about preferred reference quality, styling, or reminders."
                className="rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-subtle)] px-4 py-3 text-sm leading-7 text-[var(--ink-strong)] outline-none focus:border-[var(--accent-sea)]"
              />
            </label>
          </div>

          {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-[var(--surface-dark)] px-5 py-3 text-sm font-semibold text-[var(--surface-base)] disabled:opacity-60"
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
            <p className="text-sm font-semibold text-[var(--ink-strong)]">
              Profile created
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
              Upload the first reference photos now, then continue to the detailed profile page for manual checklist tagging.
            </p>
          </div>

          <PhotoUploader profileId={createdProfileId} />

          <Link
            href={`/app/profiles/${createdProfileId}`}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-dark)] px-5 py-3 text-sm font-semibold text-[var(--surface-base)]"
          >
            Continue to profile detail
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}
    </div>
  );
}
