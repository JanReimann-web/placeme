"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PlaceMeLogo } from "@/components/place-me-logo";
import { useAuth } from "@/hooks/use-auth";

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

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className="google-icon"
    >
      <path
        fill="#4285F4"
        d="M21.64 12.2c0-.64-.06-1.25-.17-1.84H12v3.48h5.41a4.63 4.63 0 0 1-2.01 3.03v2.5h3.25c1.9-1.75 2.99-4.33 2.99-7.17Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.97-.9 6.63-2.43l-3.25-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.58-4.12H3.06v2.58A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.42 13.91A6 6 0 0 1 6.1 12c0-.66.11-1.3.32-1.91V7.51H3.06A10 10 0 0 0 2 12c0 1.61.38 3.14 1.06 4.49l3.36-2.58Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.97c1.47 0 2.78.51 3.81 1.5l2.85-2.85C16.96 3.05 14.7 2 12 2A10 10 0 0 0 3.06 7.51l3.36 2.58C7.2 7.73 9.4 5.97 12 5.97Z"
      />
    </svg>
  );
}

function GoogleButton({ submitting }: { submitting: boolean }) {
  return (
    <>
      <span className="g-icon">
        <GoogleIcon />
      </span>
      <span className="google-btn-label">
        {submitting ? "Signing in..." : "Continue with Google"}
      </span>
      <span className="google-btn-spacer" aria-hidden="true" />
    </>
  );
}

function ShowcaseCard() {
  return (
    <section className="showcase">
      <h2 className="section-title">From Portrait to Postcard</h2>
      <div className="comparison-grid">
        <div className="image-card">
          <div className="main-img showcase-photo-frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/landing/reference-photo.jpg"
              alt="Reference portrait"
              className="showcase-photo"
              loading="eager"
              decoding="async"
            />
          </div>
          <div className="label-group">
            <span className="label-title">YOUR PHOTO SET</span>
            <span className="label-sub">Multiple clear angles</span>
          </div>
        </div>
        <div className="image-card">
          <div className="main-img showcase-photo-frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/landing/ai-travel-photo.jpg"
              alt="AI travel photo in Paris"
              className="showcase-photo"
              loading="eager"
              decoding="async"
            />
          </div>
          <div className="label-group">
            <span className="label-title">PARIS EDIT</span>
            <span className="label-sub">Styled and share-ready</span>
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
    <main className="landing-shell">
      <div className="app-container">
        <header className="header">
          <PlaceMeLogo
            className="logo"
            markClassName="h-11 w-8 sm:h-12 sm:w-9"
            wordmarkClassName="!text-[2.3rem] !font-bold !text-[#2d145c] sm:!text-[2.5rem]"
          />
        </header>

        <div className="landing-layout">
          <section className="hero">
            <span className="hero-kicker">Your travel photo studio</span>
            <h1 className="headline">
              Look like you
              <br />
              flew there.
            </h1>

            <p className="subtext">
              Start with a small set of clear photos, then create polished
              travel portraits in Paris, New York, Kyoto, and beyond.
            </p>

            {isConfigured ? (
              <button
                type="button"
                onClick={() => void handleSignIn()}
                disabled={submitting}
                className="google-btn premium-pressable"
              >
                <GoogleButton submitting={submitting} />
              </button>
            ) : (
              <div className="landing-warning">
                Firebase setup is missing, so Google sign-in is not available
                yet.
              </div>
            )}

            {!error ? (
              <p className="cta-note">
                Private Google sign-in. Best results come from multiple clear
                photos.
              </p>
            ) : null}

            {error ? <p className="landing-error">{error}</p> : null}
          </section>

          <ShowcaseCard />
        </div>
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
