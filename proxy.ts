import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const CANONICAL_HOST = "placeme-ai.vercel.app";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host");

  if (
    process.env.VERCEL_ENV === "production" &&
    host &&
    host !== CANONICAL_HOST &&
    host.endsWith(".vercel.app")
  ) {
    const url = request.nextUrl.clone();
    url.protocol = "https";
    url.host = CANONICAL_HOST;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|icon|apple-icon|manifest.webmanifest|sw.js).*)"],
};
