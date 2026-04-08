import type { FirebaseOptions } from "firebase/app";
import { getApps, initializeApp } from "firebase/app";

function readFirebaseEnvValue(name: keyof NodeJS.ProcessEnv) {
  const value = process.env[name];

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : undefined;
}

function readFirebaseConfig(): FirebaseOptions {
  return {
    apiKey: readFirebaseEnvValue("NEXT_PUBLIC_FIREBASE_API_KEY"),
    authDomain: readFirebaseEnvValue("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: readFirebaseEnvValue("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: readFirebaseEnvValue("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: readFirebaseEnvValue("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    appId: readFirebaseEnvValue("NEXT_PUBLIC_FIREBASE_APP_ID"),
  };
}

export function isFirebaseConfigured() {
  const config = readFirebaseConfig();
  return Object.values(config).every(Boolean);
}

export function ensureFirebaseConfigured() {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Add the required NEXT_PUBLIC_FIREBASE_* variables.",
    );
  }
}

export function getFirebaseApp() {
  ensureFirebaseConfigured();
  return getApps()[0] ?? initializeApp(readFirebaseConfig());
}
