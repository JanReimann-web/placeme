"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { subscribeGeneratedImages, subscribeJob, subscribeJobImages, subscribeJobs } from "@/services/job-service";
import type { GeneratedImage, GenerationJob } from "@/types/domain";

export function useJobs() {
  const { user } = useAuth();
  const [state, setState] = useState<{
    userId: string | null;
    jobs: GenerationJob[];
    loading: boolean;
    error: string | null;
  }>({
    userId: null,
    jobs: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    const unsubscribe = subscribeJobs(
      user.uid,
      (nextJobs) => {
        setState({
          userId: user.uid,
          jobs: nextJobs,
          loading: false,
          error: null,
        });
      },
      (nextError) => {
        setState({
          userId: user.uid,
          jobs: [],
          loading: false,
          error: nextError.message,
        });
      },
    );

    return unsubscribe;
  }, [user]);

  if (!user) {
    return { jobs: [], loading: false, error: null };
  }

  if (state.userId !== user.uid) {
    return { jobs: [], loading: true, error: null };
  }

  return {
    jobs: state.jobs,
    loading: state.loading,
    error: state.error,
  };
}

export function useJob(jobId?: string) {
  const { user } = useAuth();
  const [state, setState] = useState<{
    jobId: string | null;
    job: GenerationJob | null;
    loading: boolean;
    error: string | null;
  }>({
    jobId: null,
    job: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user || !jobId) {
      return;
    }

    const unsubscribe = subscribeJob(
      user.uid,
      jobId,
      (nextJob) => {
        setState({
          jobId,
          job: nextJob,
          loading: false,
          error: null,
        });
      },
      (nextError) => {
        setState({
          jobId,
          job: null,
          loading: false,
          error: nextError.message,
        });
      },
    );

    return unsubscribe;
  }, [jobId, user]);

  if (!user || !jobId) {
    return { job: null, loading: false, error: null };
  }

  if (state.jobId !== jobId) {
    return { job: null, loading: true, error: null };
  }

  return {
    job: state.job,
    loading: state.loading,
    error: state.error,
  };
}

export function useJobImages(jobId?: string) {
  const { user } = useAuth();
  const [state, setState] = useState<{
    jobId: string | null;
    images: GeneratedImage[];
    loading: boolean;
    error: string | null;
  }>({
    jobId: null,
    images: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user || !jobId) {
      return;
    }

    const unsubscribe = subscribeJobImages(
      user.uid,
      jobId,
      (nextImages) => {
        setState({
          jobId,
          images: nextImages,
          loading: false,
          error: null,
        });
      },
      (nextError) => {
        setState({
          jobId,
          images: [],
          loading: false,
          error: nextError.message,
        });
      },
    );

    return unsubscribe;
  }, [jobId, user]);

  if (!user || !jobId) {
    return { images: [], loading: false, error: null };
  }

  if (state.jobId !== jobId) {
    return { images: [], loading: true, error: null };
  }

  return {
    images: state.images,
    loading: state.loading,
    error: state.error,
  };
}

export function useGeneratedGallery() {
  const { user } = useAuth();
  const [state, setState] = useState<{
    userId: string | null;
    images: GeneratedImage[];
    loading: boolean;
    error: string | null;
  }>({
    userId: null,
    images: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    const unsubscribe = subscribeGeneratedImages(
      user.uid,
      (nextImages) => {
        setState({
          userId: user.uid,
          images: nextImages,
          loading: false,
          error: null,
        });
      },
      (nextError) => {
        setState({
          userId: user.uid,
          images: [],
          loading: false,
          error: nextError.message,
        });
      },
    );

    return unsubscribe;
  }, [user]);

  if (!user) {
    return { images: [], loading: false, error: null };
  }

  if (state.userId !== user.uid) {
    return { images: [], loading: true, error: null };
  }

  return {
    images: state.images,
    loading: state.loading,
    error: state.error,
  };
}
