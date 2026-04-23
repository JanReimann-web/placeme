"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  const railRef = useRef<HTMLElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const element = railRef.current;

    if (!element) {
      return;
    }

    const updateScrollAffordances = () => {
      const maxScrollLeft = Math.max(
        element.scrollWidth - element.clientWidth,
        0,
      );

      setCanScrollLeft(element.scrollLeft > 8);
      setCanScrollRight(element.scrollLeft < maxScrollLeft - 8);
    };

    const handleScroll = () => {
      updateScrollAffordances();
    };

    const animationFrameId = window.requestAnimationFrame(
      updateScrollAffordances,
    );

    element.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateScrollAffordances);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      element.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateScrollAffordances);
    };
  }, [profiles.length]);

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
        title="Reference profiles"
        description="People and pets ready for new scenes."
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
        <div className="relative">
          <section
            ref={railRef}
            className="snap-rail snap-rail-lg-grid no-scrollbar gap-4 lg:grid-cols-2 xl:grid-cols-3"
          >
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className={deletingId === profile.id ? "opacity-60" : ""}
              >
                <ProfileCard profile={profile} onDelete={handleDelete} />
              </div>
            ))}
          </section>

          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-y-0 left-0 w-10 rounded-l-[28px] bg-gradient-to-r from-[var(--surface-base)] via-[rgb(var(--surface-base-rgb)/0.88)] to-transparent transition-opacity duration-300 lg:hidden ${
              canScrollLeft ? "opacity-100" : "opacity-0"
            }`}
          />
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-y-0 right-0 w-10 rounded-r-[28px] bg-gradient-to-l from-[var(--surface-base)] via-[rgb(var(--surface-base-rgb)/0.88)] to-transparent transition-opacity duration-300 lg:hidden ${
              canScrollRight ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
      ) : (
        <EmptyState
          title="No profiles yet"
          description="Create the first profile and add clear references."
          actionHref="/app/profiles/new"
          actionLabel="Create your first profile"
        />
      )}
    </div>
  );
}
