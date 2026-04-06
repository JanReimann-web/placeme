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
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function shouldUseRedirectAuth() {
  if (typeof navigator === "undefined" || typeof window === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const isInAppBrowser =
    /fban|fbav|instagram|line|wv|snapchat|micromessenger/i.test(userAgent);

  return isInAppBrowser;
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
    message.includes("operation-not-supported")
  );
}

export function AuthProvider({ children }: PropsWithChildren) {
  const configured = isFirebaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(
    configured ? "loading" : "unauthenticated",
  );

  useEffect(() => {
    if (!configured) {
      return;
    }

    const auth = getFirebaseAuth();
    let active = true;
    let unsubscribe = () => {};

    const initializeAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (error) {
        console.error("Failed to set Firebase auth persistence.", error);
      }

      try {
        const redirectResult = await getRedirectResult(auth);

        if (redirectResult?.user) {
          await syncUserRecord(redirectResult.user);
        }
      } catch (error) {
        console.error("Failed to complete redirect sign-in.", error);
      }
      if (!active) {
        return;
      }

      setUser(auth.currentUser);
      setStatus(auth.currentUser ? "authenticated" : "unauthenticated");

      unsubscribe = onAuthStateChanged(auth, (nextUser) => {
        if (!active) {
          return;
        }

        setUser(nextUser);
        setStatus(nextUser ? "authenticated" : "unauthenticated");

        if (nextUser) {
          void syncUserRecord(nextUser);
        }
      });
    };

    void initializeAuth();

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
      async signInWithGoogle() {
        if (!configured) {
          throw new Error("Firebase is not configured.");
        }

        const auth = getFirebaseAuth();
        const provider = getGoogleProvider();
        await setPersistence(auth, browserLocalPersistence);

        if (shouldUseRedirectAuth()) {
          await signInWithRedirect(auth, provider);
          return;
        }

        try {
          const result = await signInWithPopup(auth, provider);
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
    [configured, status, user],
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
