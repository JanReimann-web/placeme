import { initializeApp } from "firebase-admin/app";
import { defineSecret } from "firebase-functions/params";
import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

initializeApp();

setGlobalOptions({
  maxInstances: 10,
  region: "europe-west1",
});

const geminiApiKey = defineSecret("GEMINI_API_KEY");
const processorSecret = defineSecret("PLACE_ME_PROCESSOR_SECRET");

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

    // TODO(Gemini): validate the incoming generation job payload.
    // TODO(Gemini): load profile references and source images from Firestore and Storage using Firebase Admin.
    // TODO(Gemini): call Gemini image generation or image editing APIs from this trusted backend runtime.
    // TODO(Gemini): write job status updates and generated image metadata back to Firestore.

    response.status(501).json({
      ok: false,
      status: "not-implemented",
      message:
        "PlaceMe backend processor placeholder is deployed, but Gemini image generation is not implemented yet.",
    });
  },
);
