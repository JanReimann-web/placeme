"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { PlaceMeLogo } from "@/components/place-me-logo";
import { useAuth } from "@/hooks/use-auth";

const featurePoints = [
  "Generate destination-led travel sets from your reference photos",
  "Keep every profile, job, and output private to your account",
  "Review before-and-after identity consistency in one clean flow",
];

function toFriendlyAuthError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Google sign-in failed.";
  }

  const message = error.message.toLowerCase();

  if (message.includes("unauthorized-domain")) {
    return "This domain is not yet allowed in Firebase Auth. Add placeme-ai.vercel.app to Firebase Authorized domains.";
  }

  if (
    message.includes("popup") ||
    message.includes("iframe") ||
    message.includes("illegal url for new iframe")
  ) {
    return "This mobile browser blocked popup sign-in. Retry once. If needed, open the link directly in Chrome or Safari.";
  }

  return error.message;
}

function StatusChrome() {
  return (
    <div className="mb-6 flex items-center justify-between px-2 text-[0.95rem] font-semibold text-[#16110d] lg:hidden">
      <span>9:41</span>
      <div className="flex items-center gap-2">
        <span className="flex items-end gap-[2px]">
          <span className="block h-2 w-[3px] rounded-full bg-[#16110d]" />
          <span className="block h-3 w-[3px] rounded-full bg-[#16110d]" />
          <span className="block h-4 w-[3px] rounded-full bg-[#16110d]" />
          <span className="block h-5 w-[3px] rounded-full bg-[#16110d]" />
        </span>
        <span className="relative h-4 w-6 rounded-[6px] border border-[#16110d]">
          <span className="absolute inset-y-[2px] left-[2px] right-[5px] rounded-[4px] bg-[#16110d]" />
          <span className="absolute right-[-3px] top-[4px] h-2 w-[2px] rounded-full bg-[#16110d]" />
        </span>
      </div>
    </div>
  );
}

function GoogleButtonContent({ submitting }: { submitting: boolean }) {
  return (
    <>
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-[2rem] font-semibold tracking-[-0.05em] text-white">
        G
      </span>
      <span className="flex-1 text-left text-[1.55rem] font-medium tracking-[-0.03em] text-white">
        {submitting ? "Signing in..." : "Continue with Google"}
      </span>
      <ArrowRight className="h-7 w-7 shrink-0 text-white" />
    </>
  );
}

function BeforeAfterShowcase() {
  return (
    <section className="mt-8 lg:mt-0">
      <div className="flex items-center justify-between">
        <h2 className="display-type text-[2.3rem] leading-none tracking-[-0.04em] text-[#16110d] sm:text-[2.6rem]">
          Before &amp; After
        </h2>
        <span className="hidden rounded-full border border-[#d8c7a6] bg-white/70 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-[#8e764b] lg:inline-flex">
          Identity-first
        </span>
      </div>

      <div className="mt-5 overflow-hidden rounded-[30px] border border-[#eadfc8] bg-white/90 p-2 shadow-[0_18px_48px_rgba(52,38,21,0.10)]">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-[24px] bg-[#f2ebe0] p-2">
            <div className="showcase-shot reference-shot" />
          </div>
          <div className="rounded-[24px] bg-[#efe6d8] p-2">
            <div className="showcase-shot travel-shot" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 px-4 pb-3 pt-4">
          <div>
            <p className="text-[0.88rem] font-semibold uppercase tracking-[0.08em] text-[#16110d]">
              Reference
            </p>
            <p className="mt-1 text-[1rem] leading-7 text-[#64574a]">
              Upload your photo
            </p>
          </div>
          <div>
            <p className="text-[0.88rem] font-semibold uppercase tracking-[0.08em] text-[#16110d]">
              AI travel photo
            </p>
            <p className="mt-1 text-[1rem] leading-7 text-[#64574a]">
              Destination: Paris
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, status, signInWithGoogle, isConfigured } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const nextHref = searchParams.get("next") || "/app";

  useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace(nextHref);
    }
  }, [nextHref, router, status, user]);

  const handleSignIn = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await signInWithGoogle();
    } catch (nextError) {
      setError(toFriendlyAuthError(nextError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen px-3 py-3 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-7xl">
        <section className="landing-card mx-auto min-h-[calc(100vh-1.5rem)] rounded-[38px] px-5 pb-6 pt-5 shadow-[0_28px_80px_rgba(75,56,24,0.16)] sm:min-h-[calc(100vh-3rem)] sm:px-8 sm:pb-8 sm:pt-6 lg:min-h-[720px] lg:px-10 lg:pb-10 lg:pt-8">
          <div className="landing-notch mx-auto mb-4 hidden h-8 w-44 rounded-b-[24px] bg-[rgba(247,242,232,0.94)] lg:block" />
          <StatusChrome />

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:gap-10">
            <div className="max-w-3xl">
              <PlaceMeLogo markClassName="h-14 w-14 sm:h-16 sm:w-16" wordmarkClassName="text-[2.7rem] sm:text-[3.2rem]" />

              <div className="mt-10 sm:mt-12">
                <h1 className="display-type max-w-3xl text-[4rem] leading-[0.92] tracking-[-0.05em] text-[#16110d] sm:text-[4.85rem] lg:text-[5.75rem]">
                  Travel the World,
                  <br />
                  Virtually.
                </h1>
                <p className="mt-6 max-w-2xl text-[1.2rem] leading-[1.42] tracking-[-0.02em] text-[#1d1713] sm:text-[1.45rem] lg:text-[1.6rem]">
                  Your exclusive AI Travel Image Studio. Upload your reference
                  photos to generate stunning, realistic travel images of
                  yourself and companions in iconic destinations like New York,
                  Paris, Tokyo, and beyond.
                </p>
              </div>

              <div className="mt-8 lg:mt-10">
                {isConfigured ? (
                  <button
                    type="button"
                    onClick={() => void handleSignIn()}
                    disabled={submitting}
                    className="landing-google-button flex w-full items-center gap-4 rounded-full px-5 py-4 transition hover:translate-y-[-1px] hover:opacity-95 disabled:translate-y-0 disabled:opacity-65 sm:px-6 sm:py-5"
                  >
                    <GoogleButtonContent submitting={submitting} />
                  </button>
                ) : (
                  <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-800">
                    Firebase setup is missing, so Google sign-in is not
                    available yet.
                  </div>
                )}

                {error ? (
                  <p className="mt-4 rounded-2xl bg-white/60 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </p>
                ) : null}
              </div>

              <div className="mt-8 hidden lg:grid lg:grid-cols-3 lg:gap-3">
                {featurePoints.map((point) => (
                  <div
                    key={point}
                    className="rounded-[24px] border border-[#eadfc8] bg-white/72 px-4 py-4 text-sm leading-6 text-[#5d4f43]"
                  >
                    {point}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <BeforeAfterShowcase />

              <div className="mt-8 grid gap-3 text-[1.05rem] text-[#27201a] sm:grid-cols-2 lg:mt-10">
                <div className="flex items-center gap-3 rounded-[22px] border border-[#eadfc8] bg-white/70 px-4 py-4">
                  <LockKeyhole className="h-5 w-5 text-[#16110d]" />
                  <span>Private by default</span>
                </div>
                <Link
                  href="/app"
                  className="flex items-center justify-between rounded-[22px] border border-[#eadfc8] bg-white/70 px-4 py-4 text-[#16110d] transition hover:bg-white"
                >
                  <span>Open Studio</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen" />}>
      <LoginPageContent />
    </Suspense>
  );
}
