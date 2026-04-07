"use client";

import { useEffect, useState } from "react";
import { useAppDataContext } from "@/components/app-data-provider";
import { useAuth } from "@/hooks/use-auth";
import {
  subscribeProfile,
  subscribeProfilePhotos,
  subscribeProfiles,
} from "@/services/profile-service";
import type { Profile, ProfilePhoto } from "@/types/domain";

export function useProfiles() {
  const { user } = useAuth();
  const appData = useAppDataContext();
  const [state, setState] = useState<{
    userId: string | null;
    profiles: Profile[];
    loading: boolean;
    error: string | null;
  }>({
    userId: null,
    profiles: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (appData || !user) {
      return;
    }

    const unsubscribe = subscribeProfiles(
      user.uid,
      (nextProfiles) => {
        setState({
          userId: user.uid,
          profiles: nextProfiles,
          loading: false,
          error: null,
        });
      },
      (nextError) => {
        setState({
          userId: user.uid,
          profiles: [],
          loading: false,
          error: nextError.message,
        });
      },
    );

    return unsubscribe;
  }, [appData, user]);

  if (!user) {
    return { profiles: [], loading: false, error: null };
  }

  if (appData) {
    if (appData.profiles.userId !== user.uid) {
      return { profiles: [], loading: true, error: null };
    }

    return {
      profiles: appData.profiles.items,
      loading: appData.profiles.loading,
      error: appData.profiles.error,
    };
  }

  if (state.userId !== user.uid) {
    return { profiles: [], loading: true, error: null };
  }

  return {
    profiles: state.profiles,
    loading: state.loading,
    error: state.error,
  };
}

export function useProfile(profileId?: string) {
  const { user } = useAuth();
  const appData = useAppDataContext();
  const [state, setState] = useState<{
    profileId: string | null;
    profile: Profile | null;
    loading: boolean;
    error: string | null;
  }>({
    profileId: null,
    profile: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (appData || !user || !profileId) {
      return;
    }

    const unsubscribe = subscribeProfile(
      user.uid,
      profileId,
      (nextProfile) => {
        setState({
          profileId,
          profile: nextProfile,
          loading: false,
          error: null,
        });
      },
      (nextError) => {
        setState({
          profileId,
          profile: null,
          loading: false,
          error: nextError.message,
        });
      },
    );

    return unsubscribe;
  }, [appData, profileId, user]);

  if (!user || !profileId) {
    return { profile: null, loading: false, error: null };
  }

  if (appData) {
    if (appData.profiles.userId !== user.uid) {
      return { profile: null, loading: true, error: null };
    }

    return {
      profile: appData.profiles.items.find((item) => item.id === profileId) ?? null,
      loading: appData.profiles.loading,
      error: appData.profiles.error,
    };
  }

  if (state.profileId !== profileId) {
    return { profile: null, loading: true, error: null };
  }

  return {
    profile: state.profile,
    loading: state.loading,
    error: state.error,
  };
}

export function useProfilePhotos(profileId?: string) {
  const { user } = useAuth();
  const [state, setState] = useState<{
    profileId: string | null;
    photos: ProfilePhoto[];
    loading: boolean;
    error: string | null;
  }>({
    profileId: null,
    photos: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user || !profileId) {
      return;
    }

    const unsubscribe = subscribeProfilePhotos(
      user.uid,
      profileId,
      (nextPhotos) => {
        setState({
          profileId,
          photos: nextPhotos,
          loading: false,
          error: null,
        });
      },
      (nextError) => {
        setState({
          profileId,
          photos: [],
          loading: false,
          error: nextError.message,
        });
      },
    );

    return unsubscribe;
  }, [profileId, user]);

  if (!user || !profileId) {
    return { photos: [], loading: false, error: null };
  }

  if (state.profileId !== profileId) {
    return { photos: [], loading: true, error: null };
  }

  return {
    photos: state.photos,
    loading: state.loading,
    error: state.error,
  };
}
