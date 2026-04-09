import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const FALLBACK_CANONICAL_HOST = "placeme-nu.vercel.app";

function readCanonicalHost() {
  const explicitHost = process.env.CANONICAL_HOST?.trim();

  if (explicitHost) {
    return explicitHost;
  }

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

  if (productionHost) {
    return productionHost;
  }

  return FALLBACK_CANONICAL_HOST;
}

export function proxy(request: NextRequest) {
  const host = request.headers.get("host");
  const canonicalHost = readCanonicalHost();

  if (
    process.env.VERCEL_ENV === "production" &&
    host &&
    host !== canonicalHost &&
    host.endsWith(".vercel.app")
  ) {
    const url = request.nextUrl.clone();
    url.protocol = "https";
    url.host = canonicalHost;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|icon|apple-icon|manifest.webmanifest|sw.js).*)"],
};
