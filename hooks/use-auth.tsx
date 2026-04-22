"use client";

import {
  browserLocalPersistence,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { getFirebaseAuth, getGoogleProvider } from "@/firebase/auth";
import { isFirebaseConfigured } from "@/firebase/config";
import { syncUserRecord } from "@/services/user-service";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  isConfigured: boolean;
  authError: Error | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
let persistencePromise: Promise<void> | null = null;
const POPUP_FALLBACK_MS = 4500;

function shouldUseRedirectAuth() {
  if (typeof navigator === "undefined" || typeof window === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const isInAppBrowser =
    /fban|fbav|instagram|line|wv|snapchat|micromessenger|webview|iab|codex/i.test(userAgent);
  const isMobileBrowser =
    /android|iphone|ipad|ipod|mobile/i.test(userAgent) ||
    (navigator.maxTouchPoints > 0 && window.innerWidth < 920);

  let isEmbedded = false;

  try {
    isEmbedded = window.self !== window.top;
  } catch {
    isEmbedded = true;
  }

  return isInAppBrowser || isMobileBrowser || isEmbedded;
}

function shouldFallbackToRedirect(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes("popup") ||
    message.includes("redirect") ||
    message.includes("iframe") ||
    message.includes("operation-not-supported") ||
    message.includes("timed out")
  );
}

function withPopupFallbackTimeout<T>(promise: Promise<T>) {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      window.setTimeout(() => {
        reject(
          new Error(
            "Google sign-in popup timed out. Falling back to redirect sign-in.",
          ),
        );
      }, POPUP_FALLBACK_MS);
    }),
  ]);
}

function ensureBrowserPersistence() {
  const auth = getFirebaseAuth();

  if (!persistencePromise) {
    persistencePromise = setPersistence(auth, browserLocalPersistence).catch(
      (error) => {
        persistencePromise = null;
        throw error;
      },
    );
  }

  return persistencePromise;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const configured = isFirebaseConfigured();
  const [user, setUser] = useState<User | null>(() =>
    configured ? getFirebaseAuth().currentUser : null,
  );
  const [status, setStatus] = useState<AuthStatus>(() => {
    if (!configured) {
      return "unauthenticated";
    }

    return getFirebaseAuth().currentUser ? "authenticated" : "loading";
  });
  const [authError, setAuthError] = useState<Error | null>(null);

  useEffect(() => {
    if (!configured) {
      return;
    }

    const auth = getFirebaseAuth();
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      if (!active) {
        return;
      }

      setUser(nextUser);
      setStatus(nextUser ? "authenticated" : "unauthenticated");

      if (nextUser) {
        setAuthError(null);
        void syncUserRecord(nextUser);
      }
    });

    void ensureBrowserPersistence().catch((error) => {
      setAuthError(error instanceof Error ? error : new Error("Failed to set Firebase auth persistence."));
      console.error("Failed to set Firebase auth persistence.", error);
    });

    void ensureBrowserPersistence()
      .then(() => getRedirectResult(auth))
      .then((redirectResult) => {
        if (redirectResult?.user) {
          setAuthError(null);
          return syncUserRecord(redirectResult.user);
        }

        return undefined;
      })
      .catch((error) => {
        setAuthError(
          error instanceof Error
            ? error
            : new Error("Failed to complete redirect sign-in."),
        );
        setStatus("unauthenticated");
        console.error("Failed to complete redirect sign-in.", error);
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [configured]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isConfigured: configured,
      authError,
      async signInWithGoogle() {
        if (!configured) {
          throw new Error("Firebase is not configured.");
        }

        const auth = getFirebaseAuth();
        const provider = getGoogleProvider();
        await ensureBrowserPersistence();
        setAuthError(null);

        if (shouldUseRedirectAuth()) {
          await signInWithRedirect(auth, provider);
          return;
        }

        try {
          const result = await withPopupFallbackTimeout(
            signInWithPopup(auth, provider),
          );
          setUser(result.user);
          setStatus("authenticated");
          await syncUserRecord(result.user);
        } catch (error) {
          if (shouldFallbackToRedirect(error)) {
            await signInWithRedirect(auth, provider);
            return;
          }

          throw error;
        }
      },
      async signOutUser() {
        if (!configured) {
          return;
        }

        await signOut(getFirebaseAuth());
      },
    }),
    [authError, configured, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
