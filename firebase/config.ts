import type { FirebaseOptions } from "firebase/app";
import { getApps, initializeApp } from "firebase/app";

function readFirebaseConfig(): FirebaseOptions {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
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
