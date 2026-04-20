"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { PageHero } from "@/components/page-hero";
import { ProfileCard } from "@/components/profile-card";
import { useAuth } from "@/hooks/use-auth";
import { useProfiles } from "@/hooks/use-profiles";
import { deleteProfile } from "@/services/profile-service";
import type { Profile } from "@/types/domain";

export default function ProfilesPage() {
  const { user } = useAuth();
  const { profiles, loading, error } = useProfiles();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (profile: Profile) => {
    if (!user) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${profile.displayName}? This removes the profile and its uploaded reference photos.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(profile.id);
    try {
      await deleteProfile(user.uid, profile.id);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <LoadingState label="Loading your profile library" />;
  }

  if (error) {
    return (
      <ErrorState
        title="The profile library could not be loaded"
        description={error}
        actionHref="/app"
        actionLabel="Back to overview"
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Profiles"
        title="Private person libraries"
        description="Build fuller photo sets for yourself or close companions before you move into scene generation."
        action={
          <Link
            href="/app/profiles/new"
            className="premium-pressable premium-action inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Create profile
          </Link>
        }
      />

      {profiles.length ? (
        <section className="snap-rail snap-rail-lg-grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => (
            <div key={profile.id} className={deletingId === profile.id ? "opacity-60" : ""}>
              <ProfileCard profile={profile} onDelete={handleDelete} />
            </div>
          ))}
        </section>
      ) : (
        <EmptyState
          title="No profiles yet"
          description="Create yourself first, then add a partner, child, parent, or friend when you want to test shared travel photos."
          actionHref="/app/profiles/new"
          actionLabel="Create your first profile"
        />
      )}
    </div>
  );
}
