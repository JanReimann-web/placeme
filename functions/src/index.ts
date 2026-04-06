import { initializeApp } from "firebase-admin/app";
import { defineSecret } from "firebase-functions/params";
import { setGlobalOptions } from "firebase-functions";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { processCreatedGenerationJob } from "./generation/processor";

initializeApp();

setGlobalOptions({
  maxInstances: 10,
  region: "europe-west1",
});

const geminiApiKey = defineSecret("GEMINI_API_KEY");
const processorSecret = defineSecret("PLACE_ME_PROCESSOR_SECRET");

export const onGenerationJobCreated = onDocumentCreated(
  {
    document: "generationJobs/{jobId}",
    retry: true,
    timeoutSeconds: 120,
    memory: "1GiB",
    secrets: [geminiApiKey],
  },
  async (event) => {
    const jobId = event.params.jobId;

    logger.info("Received new generation job document.", { jobId });
    await processCreatedGenerationJob(jobId);
  },
);

export const placeMeGenerationHealth = onRequest(
  {
    invoker: "public",
    secrets: [geminiApiKey, processorSecret],
  },
  (request, response) => {
    response.status(200).json({
      ok: true,
      service: "placeme-generation",
      method: request.method,
      hasGeminiKey: Boolean(geminiApiKey.value()),
      hasProcessorSecret: Boolean(processorSecret.value()),
      status: "placeholder-ready",
    });
  },
);

export const processPlaceMeGenerationJob = onRequest(
  {
    invoker: "public",
    secrets: [geminiApiKey, processorSecret],
    timeoutSeconds: 60,
    memory: "512MiB",
  },
  async (request, response) => {
    if (request.method !== "POST") {
      response.status(405).json({ error: "Method not allowed." });
      return;
    }

    const requestSecret = request.header("x-placeme-processor-secret");

    if (!requestSecret || requestSecret !== processorSecret.value()) {
      response.status(401).json({ error: "Unauthorized." });
      return;
    }

    logger.info("Received PlaceMe generation placeholder request", {
      hasBody: Boolean(request.body),
    });

    // TODO(Gemini): repurpose this endpoint for manual job retries or direct worker dispatch if needed.
    // TODO(Gemini): use the same backend generation modules wired into the Firestore trigger above.

    response.status(501).json({
      ok: false,
      status: "not-implemented",
      message:
        "PlaceMe now processes generation jobs from Firestore on the backend. Gemini image generation is still not implemented yet.",
    });
  },
);
