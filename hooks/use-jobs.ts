"use client";

import { useEffect, useState } from "react";
import { useAppDataContext } from "@/components/app-data-provider";
import { useAuth } from "@/hooks/use-auth";
import {
  deleteGeneratedImage,
  getGeneratedImagesOnce,
  getJobImagesOnce,
  subscribeJob,
  subscribeJobs,
} from "@/services/job-service";
import {
  listLocalGeneratedImages,
  listLocalJobImages,
  saveGeneratedImagesLocally,
  subscribeLocalGeneratedImageChanges,
} from "@/services/local-generated-image-service";
import type { GeneratedImage, GenerationJob } from "@/types/domain";

function getGalleryImportKey(userId: string) {
  return `placeme-generated-images-local-import:${userId}:v1`;
}

function getJobImportKey(userId: string, jobId: string) {
  return `placeme-generated-images-local-import:${userId}:${jobId}:v1`;
}

async function deleteCloudImagesAfterLocalImport(
  userId: string,
  images: GeneratedImage[],
) {
  await Promise.all(
    images.map((image) =>
      deleteGeneratedImage(userId, image.id).catch(() => undefined),
    ),
  );
}

export function useJobs() {
  const { user } = useAuth();
  const appData = useAppDataContext();
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
    if (appData || !user) {
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
  }, [appData, user]);

  if (!user) {
    return { jobs: [], loading: false, error: null };
  }

  if (appData) {
    if (appData.jobs.userId !== user.uid) {
      return { jobs: [], loading: true, error: null };
    }

    return {
      jobs: appData.jobs.items,
      loading: appData.jobs.loading,
      error: appData.jobs.error,
    };
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
  const appData = useAppDataContext();
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
    if (appData || !user || !jobId) {
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
  }, [appData, jobId, user]);

  if (!user || !jobId) {
    return { job: null, loading: false, error: null };
  }

  if (appData) {
    if (appData.jobs.userId !== user.uid) {
      return { job: null, loading: true, error: null };
    }

    return {
      job: appData.jobs.items.find((item) => item.id === jobId) ?? null,
      loading: appData.jobs.loading,
      error: appData.jobs.error,
    };
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

export function useJobImages(jobId?: string, shouldImportCloud = true) {
  const { user } = useAuth();
  const [state, setState] = useState<{
    userId: string | null;
    jobId: string | null;
    images: GeneratedImage[];
    loading: boolean;
    error: string | null;
  }>({
    userId: null,
    jobId: null,
    images: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user || !jobId) {
      return;
    }

    let cancelled = false;
    const userId = user.uid;
    const activeJobId = jobId;

    async function loadLocalImages() {
      try {
        const localImages = await listLocalJobImages(userId, activeJobId);

        if (!cancelled) {
          setState({
            userId,
            jobId: activeJobId,
            images: localImages,
            loading: false,
            error: null,
          });
        }
      } catch (nextError) {
        if (!cancelled) {
          setState({
            userId,
            jobId: activeJobId,
            images: [],
            loading: false,
            error:
              nextError instanceof Error
                ? nextError.message
                : "Local image library could not be loaded.",
          });
        }
      }
    }

    async function importCloudImagesOnce() {
      if (!shouldImportCloud) {
        return;
      }

      const importKey = getJobImportKey(userId, activeJobId);

      if (localStorage.getItem(importKey) === "done") {
        return;
      }

      try {
        const cloudImages = await getJobImagesOnce(userId, activeJobId);

        if (!cloudImages.length) {
          return;
        }

        await saveGeneratedImagesLocally(cloudImages);
        await deleteCloudImagesAfterLocalImport(userId, cloudImages);
        localStorage.setItem(importKey, "done");
        await loadLocalImages();
      } catch (nextError) {
        if (!cancelled) {
          const localImages = await listLocalJobImages(
            userId,
            activeJobId,
          ).catch(() => []);

          setState({
            userId,
            jobId: activeJobId,
            images: localImages,
            loading: false,
            error: localImages.length
              ? null
              : nextError instanceof Error
                ? nextError.message
                : "Generated images could not be imported to this device.",
          });
        }
      }
    }

    void loadLocalImages();
    void importCloudImagesOnce();

    const unsubscribe = subscribeLocalGeneratedImageChanges(() => {
      void loadLocalImages();
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [jobId, shouldImportCloud, user]);

  if (!user || !jobId) {
    return { images: [], loading: false, error: null };
  }

  if (state.userId !== user.uid || state.jobId !== jobId) {
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

    let cancelled = false;
    const userId = user.uid;

    async function loadLocalImages() {
      try {
        const localImages = await listLocalGeneratedImages(userId);

        if (!cancelled) {
          setState({
            userId,
            images: localImages,
            loading: false,
            error: null,
          });
        }
      } catch (nextError) {
        if (!cancelled) {
          setState({
            userId,
            images: [],
            loading: false,
            error:
              nextError instanceof Error
                ? nextError.message
                : "Local image library could not be loaded.",
          });
        }
      }
    }

    async function importCloudImagesOnce() {
      const importKey = getGalleryImportKey(userId);

      if (localStorage.getItem(importKey) === "done") {
        return;
      }

      try {
        const cloudImages = await getGeneratedImagesOnce(userId);

        if (!cloudImages.length) {
          return;
        }

        await saveGeneratedImagesLocally(cloudImages);
        await deleteCloudImagesAfterLocalImport(userId, cloudImages);
        localStorage.setItem(importKey, "done");
        await loadLocalImages();
      } catch (nextError) {
        if (!cancelled) {
          const localImages = await listLocalGeneratedImages(userId).catch(
            () => [],
          );

          setState({
            userId,
            images: localImages,
            loading: false,
            error: localImages.length
              ? null
              : nextError instanceof Error
                ? nextError.message
                : "Generated images could not be imported to this device.",
          });
        }
      }
    }

    void loadLocalImages();
    void importCloudImagesOnce();

    const unsubscribe = subscribeLocalGeneratedImageChanges(() => {
      void loadLocalImages();
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
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
