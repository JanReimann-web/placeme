"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Camera, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const previewCards = [
  { title: "Profile library", detail: "Reference sets for self and companions." },
  { title: "Controlled scene packs", detail: "Destination scenes stay structured for testing." },
  { title: "Consistency review", detail: "Track outputs across jobs and compare results." },
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
    return "This mobile browser blocked popup sign-in. Retry once; PlaceMe now uses redirect login on mobile. If needed, open the link directly in Chrome or Safari.";
  }

  return error.message;
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
    <main className="min-h-screen px-4 py-6 sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.9fr]">
        <section className="travel-panel flex flex-col justify-between rounded-[36px] p-8 sm:p-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-dark)] text-[var(--surface-base)]">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-sea)]">
                  PlaceMe
                </p>
                <p className="display-type text-3xl text-[var(--ink-strong)]">
                  Private travel image studio
                </p>
              </div>
            </div>

            <div className="mt-12 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--ink-muted)]">
                MVP focus
              </p>
              <h1 className="display-type mt-4 text-5xl leading-[0.95] text-[var(--ink-strong)] sm:text-6xl">
                Create AI travel photos of yourself anywhere in the world.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-[var(--ink-soft)] sm:text-lg">
                Build your personal profile library and generate destination photo sets. Travel solo or with someone you love.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {previewCards.map((card) => (
              <div
                key={card.title}
                className="travel-gradient rounded-[28px] p-5"
              >
                <p className="text-lg font-semibold text-[var(--ink-strong)]">
                  {card.title}
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                  {card.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="travel-panel flex flex-col justify-between rounded-[36px] p-8 sm:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-sea)]">
              Access
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-[var(--ink-strong)]">
              Sign in with Google
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
              PlaceMe keeps profile libraries, jobs, and outputs private to the signed-in Firebase user.
            </p>

            <div className="mt-10 rounded-[28px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-5">
              <p className="text-sm font-semibold text-[var(--ink-strong)]">
                Included in this MVP
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--ink-soft)]">
                <li>Clean onboarding and private Google auth</li>
                <li>Profile libraries with photo readiness tracking</li>
                <li>Structured generation jobs and gallery history</li>
              </ul>
            </div>
          </div>

          <div className="mt-10">
            {isConfigured ? (
              <button
                type="button"
                onClick={() => void handleSignIn()}
                disabled={submitting}
                className="flex w-full items-center justify-center gap-3 rounded-full bg-[var(--surface-dark)] px-5 py-4 text-sm font-semibold text-[var(--surface-base)] transition hover:opacity-90 disabled:opacity-60"
              >
                <LogIn className="h-4 w-4" />
                {submitting ? "Signing in..." : "Continue with Google"}
              </button>
            ) : (
              <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-800">
                Firebase environment variables are missing. Add the required values in `.env.local` to enable sign-in.
              </div>
            )}

            {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

            <div className="mt-8 flex items-center justify-between text-sm text-[var(--ink-soft)]">
              <span>PWA-ready private MVP</span>
              <Link href="/app" className="inline-flex items-center gap-2 font-semibold text-[var(--ink-strong)]">
                View app shell
                <ArrowRight className="h-4 w-4" />
              </Link>
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
