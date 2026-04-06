import "server-only";

import { processGenerationJob } from "@/services/generation/job-orchestrator";
import type {
  GenerationInput,
  GenerationRunResult,
  JobStatusUpdate,
} from "@/types/generation";

export interface ServerGenerationProcessResponse {
  statusUpdates: JobStatusUpdate[];
  result: GenerationRunResult;
}

export async function processGenerationJobOnServer(
  input: GenerationInput,
): Promise<ServerGenerationProcessResponse> {
  const processingUpdate: JobStatusUpdate = {
    jobId: input.jobId,
    userId: input.userId,
    status: "processing",
    errorMessage: null,
    processedSceneCount: 0,
  };

  try {
    // TODO(Gemini): load secure profile reference assets and call Gemini from this trusted server flow.
    // TODO(Gemini): persist job updates and generated assets with Firebase Admin SDK or another backend repository.
    const result = await processGenerationJob(input);

    return {
      statusUpdates: [
        processingUpdate,
        {
          jobId: input.jobId,
          userId: input.userId,
          status: result.status,
          errorMessage: result.errorMessage,
          providerId: result.providerId,
          processedSceneCount: result.sceneCount,
        },
      ],
      result,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Server generation failed.";

    return {
      statusUpdates: [
        processingUpdate,
        {
          jobId: input.jobId,
          userId: input.userId,
          status: "failed",
          errorMessage: message,
          processedSceneCount: 0,
        },
      ],
      result: {
        jobId: input.jobId,
        providerId: "server-placeholder",
        status: "failed",
        sceneCount: 0,
        images: [],
        errorMessage: message,
      },
    };
  }
}
