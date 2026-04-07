"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LockKeyhole } from "lucide-react";
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

function GoogleButton({ submitting }: { submitting: boolean }) {
  return (
    <>
      <span className="g-icon">G</span>
      <span>{submitting ? "Signing in..." : "Continue with Google"}</span>
      <span className="arrow">→</span>
    </>
  );
}

function ShowcaseCard() {
  return (
    <section className="showcase">
      <h2 className="section-title">Before &amp; After</h2>
      <div className="comparison-grid">
        <div className="image-card">
          <div className="main-img showcase-photo-frame">
            <Image
              src="/landing/reference-photo.png"
              alt="Reference portrait"
              fill
              priority
              sizes="(max-width: 1023px) 44vw, 24rem"
              className="showcase-photo"
            />
          </div>
          <div className="label-group">
            <span className="label-title">REFERENCE</span>
            <span className="label-sub">Upload your photo</span>
          </div>
        </div>
        <div className="image-card">
          <div className="main-img showcase-photo-frame">
            <Image
              src="/landing/ai-travel-photo.png"
              alt="AI travel photo in Paris"
              fill
              priority
              sizes="(max-width: 1023px) 44vw, 24rem"
              className="showcase-photo"
            />
          </div>
          <div className="label-group">
            <span className="label-title">AI TRAVEL PHOTO</span>
            <span className="label-sub">Destination: Paris</span>
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
            markClassName="h-14 w-10 sm:h-[3.75rem] sm:w-[2.75rem]"
            wordmarkClassName="!text-[2.9rem] sm:!text-[3.2rem]"
          />
        </header>

        <div className="landing-layout">
          <section className="hero">
            <h1 className="headline">
              Travel the World,
              <br />
              Virtually.
            </h1>

            <p className="subtext">
              Your exclusive AI Travel Image Studio. Upload your reference
              photos to generate stunning, realistic travel images of yourself
              and companions in iconic destinations like New York, Paris, Kyoto,
              and beyond.
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

            {error ? <p className="landing-error">{error}</p> : null}
          </section>

          <ShowcaseCard />
        </div>

        <footer className="footer">
          <div className="footer-item">
            <LockKeyhole className="h-5 w-5" />
            <span>Private by default</span>
          </div>
          <Link href="/app" className="footer-item open-studio">
            <span>Open Studio</span>
            <span className="arrow">→</span>
          </Link>
        </footer>
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
