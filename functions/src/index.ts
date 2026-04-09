import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
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
    timeoutSeconds: 540,
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
      status: "backend-ready",
    });
  },
);

export const processPlaceMeGenerationJob = onRequest(
  {
    invoker: "public",
    secrets: [geminiApiKey, processorSecret],
    timeoutSeconds: 540,
    memory: "1GiB",
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

    logger.info("Received PlaceMe generation reprocess request", {
      hasBody: Boolean(request.body),
    });

    const jobId = typeof request.body?.jobId === "string" ? request.body.jobId : "";

    if (!jobId) {
      response.status(400).json({
        error: "Missing jobId.",
      });
      return;
    }

    const db = getFirestore();
    const jobRef = db.collection("generationJobs").doc(jobId);
    const snapshot = await jobRef.get();

    if (!snapshot.exists) {
      response.status(404).json({ error: "Job not found." });
      return;
    }

    await jobRef.update({
      status: "pending",
      errorMessage: null,
      processedSceneCount: 0,
      providerId: null,
      updatedAt: FieldValue.serverTimestamp(),
    });

    await processCreatedGenerationJob(jobId);

    response.status(202).json({
      ok: true,
      jobId,
      status: "reprocessed",
    });
  },
);
