"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { useAuth } from "@/hooks/use-auth";
import { subscribeJobs } from "@/services/job-service";
import { subscribeProfiles } from "@/services/profile-service";
import type { GenerationJob, Profile } from "@/types/domain";

export interface AppCollectionState<T> {
  userId: string | null;
  items: T[];
  loading: boolean;
  error: string | null;
}

interface AppDataContextValue {
  profiles: AppCollectionState<Profile>;
  jobs: AppCollectionState<GenerationJob>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

function createEmptyState<T>(): AppCollectionState<T> {
  return {
    userId: null,
    items: [],
    loading: false,
    error: null,
  };
}

function createLoadingState<T>(userId: string): AppCollectionState<T> {
  return {
    userId,
    items: [],
    loading: true,
    error: null,
  };
}

export function AppDataProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<AppCollectionState<Profile>>(() =>
    createEmptyState<Profile>(),
  );
  const [jobs, setJobs] = useState<AppCollectionState<GenerationJob>>(() =>
    createEmptyState<GenerationJob>(),
  );

  useEffect(() => {
    const userId = user?.uid;

    if (!userId) {
      return;
    }

    return subscribeProfiles(
      userId,
      (items) => {
        setProfiles({
          userId,
          items,
          loading: false,
          error: null,
        });
      },
      (error) => {
        setProfiles({
          userId,
          items: [],
          loading: false,
          error: error.message,
        });
      },
    );
  }, [user?.uid]);

  useEffect(() => {
    const userId = user?.uid;

    if (!userId) {
      return;
    }

    return subscribeJobs(
      userId,
      (items) => {
        setJobs({
          userId,
          items,
          loading: false,
          error: null,
        });
      },
      (error) => {
        setJobs({
          userId,
          items: [],
          loading: false,
          error: error.message,
        });
      },
    );
  }, [user?.uid]);

  const value = useMemo(() => {
    const userId = user?.uid ?? null;

    if (!userId) {
      return {
        profiles: createEmptyState<Profile>(),
        jobs: createEmptyState<GenerationJob>(),
      };
    }

    return {
      profiles:
        profiles.userId === userId
          ? profiles
          : createLoadingState<Profile>(userId),
      jobs:
        jobs.userId === userId
          ? jobs
          : createLoadingState<GenerationJob>(userId),
    };
  }, [jobs, profiles, user?.uid]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppDataContext() {
  return useContext(AppDataContext);
}
