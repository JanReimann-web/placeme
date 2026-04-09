"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { ReadinessChecklist } from "@/components/readiness-checklist";
import { useAuth } from "@/hooks/use-auth";
import { useProfile, useProfilePhotos } from "@/hooks/use-profiles";
import { PROFILE_CHECKLIST_ITEMS, RELATIONSHIP_OPTIONS } from "@/lib/constants";
import { deleteProfile, deleteProfilePhoto, updateProfile, updateProfilePhotoTags } from "@/services/profile-service";
import type { ProfilePhoto, RelationshipType } from "@/types/domain";

const PhotoUploader = dynamic(
  () =>
    import("@/components/photo-uploader").then((module) => ({
      default: module.PhotoUploader,
    })),
  {
    loading: () => (
      <div className="travel-panel rounded-[30px] border border-dashed border-[var(--line-strong)] p-5 sm:rounded-[32px] sm:p-6">
        <p className="text-sm leading-7 text-[var(--ink-soft)]">
          Loading uploader...
        </p>
      </div>
    ),
  },
);

export default function ProfileDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { profile, loading, error: profileError } = useProfile(params.id);
  const { photos, loading: photosLoading, error: photosError } = useProfilePhotos(params.id);
  const [displayName, setDisplayName] = useState("");
  const [relationshipType, setRelationshipType] = useState<RelationshipType>("self");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyPhotoId, setBusyPhotoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setDisplayName(profile.displayName);
    setRelationshipType(profile.relationshipType);
    setNotes(profile.notes);
  }, [profile]);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!profile) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateProfile(profile.id, {
        displayName,
        relationshipType,
        notes,
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!user || !profile) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${profile.displayName}? This removes the profile and all uploaded reference photos.`,
    );

    if (!confirmed) {
      return;
    }

    await deleteProfile(user.uid, profile.id);
    router.push("/app/profiles");
  };

  const handleToggleTag = async (photo: ProfilePhoto, tag: typeof PROFILE_CHECKLIST_ITEMS[number]["key"]) => {
    if (!user) {
      return;
    }

    setBusyPhotoId(photo.id);
    try {
      const nextTags = photo.tags.includes(tag)
        ? photo.tags.filter((item) => item !== tag)
        : [...photo.tags, tag];
      await updateProfilePhotoTags(user.uid, photo.id, nextTags);
    } finally {
      setBusyPhotoId(null);
    }
  };

  const handleDeletePhoto = async (photo: ProfilePhoto) => {
    if (!user) {
      return;
    }

    const confirmed = window.confirm("Remove this reference photo?");

    if (!confirmed) {
      return;
    }

    setBusyPhotoId(photo.id);
    try {
      await deleteProfilePhoto(user.uid, photo.id);
    } finally {
      setBusyPhotoId(null);
    }
  };

  if (loading && !profile) {
    return <LoadingState label="Loading profile detail" />;
  }

  if (profileError) {
    return (
      <ErrorState
        title="This profile view could not load cleanly"
        description={profileError}
        actionHref="/app/profiles"
        actionLabel="Back to profiles"
      />
    );
  }

  if (!profile) {
    return (
      <EmptyState
        title="Profile not found"
        description="This profile is unavailable or no longer belongs to your account."
        actionHref="/app/profiles"
        actionLabel="Back to profiles"
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="travel-panel rounded-[30px] p-5 sm:rounded-[36px] sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-sea)]">
              Profile detail
            </p>
            <h1 className="mt-3 text-[2.35rem] font-semibold tracking-[-0.04em] text-[var(--ink-strong)] sm:mt-4 sm:text-4xl">
              {profile.displayName}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--ink-soft)]">
              Keep this profile visually strong with a balanced photo library, clear
              coverage across angles, and simple manual tagging.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleDeleteProfile()}
            className="premium-pressable premium-danger-action inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold sm:w-auto"
          >
            <Trash2 className="h-4 w-4" />
            Delete profile
          </button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <form onSubmit={handleSave} className="travel-panel rounded-[30px] p-5 sm:rounded-[36px] sm:p-8">
          <h2 className="text-2xl font-semibold text-[var(--ink-strong)]">
            Profile basics
          </h2>
          <div className="mt-6 grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-[var(--ink-strong)]">
                Display name
              </span>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
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
                rows={5}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-subtle)] px-4 py-3 text-sm leading-7 text-[var(--ink-strong)] outline-none focus:border-[var(--accent-sea)]"
              />
            </label>
          </div>

          {error ? (
            <div className="mt-5 rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={saving}
            className="premium-pressable premium-action mt-6 w-full rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-60 sm:w-auto"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>

        <ReadinessChecklist profile={profile} />
      </section>

      <section id="upload-photos" className="scroll-mt-28">
        <PhotoUploader profileId={profile.id} />
      </section>

      <section className="travel-panel rounded-[30px] p-5 sm:rounded-[36px] sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--ink-muted)]">
              Reference gallery
            </p>
            <h2 className="mt-3 text-[2rem] font-semibold text-[var(--ink-strong)] sm:text-3xl">
              Uploaded photos
            </h2>
          </div>
          <p className="text-sm text-[var(--ink-soft)]">
            Tap checklist labels on each image to manually mark coverage.
          </p>
        </div>

        {photosError ? (
          <div className="mt-6 rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            {photosError}
          </div>
        ) : photosLoading ? (
          <div className="mt-6 rounded-[28px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-5 text-sm leading-7 text-[var(--ink-soft)]">
            Loading reference photos...
          </div>
        ) : photos.length ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {photos.map((photo) => (
              <article
                key={photo.id}
                className="rounded-[28px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-4"
              >
                <div className="overflow-hidden rounded-[22px] bg-[var(--surface-strong)]">
                  <Image
                    src={photo.downloadURL}
                    alt={`${profile.displayName} reference upload`}
                    width={640}
                    height={800}
                    sizes="(min-width: 1280px) 28vw, (min-width: 768px) 44vw, 92vw"
                    className="aspect-[4/5] h-auto w-full object-cover"
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {PROFILE_CHECKLIST_ITEMS.map((item) => {
                    const active = photo.tags.includes(item.key);

                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => void handleToggleTag(photo, item.key)}
                        disabled={busyPhotoId === photo.id}
                        className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                          active
                            ? "premium-pressable premium-chip-button premium-chip-button-active"
                            : "premium-pressable premium-chip-button"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => void handleDeletePhoto(photo)}
                  disabled={busyPhotoId === photo.id}
                  className="premium-pressable premium-danger-action mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium disabled:opacity-60 sm:w-auto"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove photo
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState
              title="No photos uploaded yet"
              description="Add the first reference images here to start building readiness coverage for this profile."
            />
          </div>
        )}
      </section>
    </div>
  );
}
