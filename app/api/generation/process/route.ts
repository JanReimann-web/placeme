import { NextRequest, NextResponse } from "next/server";
import { processGenerationJobOnServer } from "@/services/generation/server-processor";
import type { GenerationInput } from "@/types/generation";

function hasValidProcessorSecret(request: NextRequest) {
  const expectedSecret = process.env.PLACE_ME_PROCESSOR_SECRET;

  if (!expectedSecret) {
    return false;
  }

  return request.headers.get("x-placeme-processor-secret") === expectedSecret;
}

function isGenerationInput(value: unknown): value is GenerationInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.jobId === "string" &&
    typeof candidate.userId === "string" &&
    typeof candidate.mode === "string" &&
    typeof candidate.destination === "string" &&
    typeof candidate.style === "string" &&
    typeof candidate.imageCount === "number" &&
    typeof candidate.scenePackId === "string" &&
    typeof candidate.primaryProfile === "object"
  );
}

export async function POST(request: NextRequest) {
  if (!process.env.PLACE_ME_PROCESSOR_SECRET) {
    return NextResponse.json(
      {
        error:
          "Server generation dispatch is not configured. Add PLACE_ME_PROCESSOR_SECRET before enabling backend processing.",
      },
      { status: 503 },
    );
  }

  if (!hasValidProcessorSecret(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = (await request.json()) as unknown;

  if (!isGenerationInput(payload)) {
    return NextResponse.json(
      { error: "Invalid generation payload." },
      { status: 400 },
    );
  }

  // TODO(Gemini): trigger this route from a trusted backend dispatcher or queue consumer, not directly from the browser.
  const response = await processGenerationJobOnServer(payload);
  return NextResponse.json(response, { status: 202 });
}
