import type { FirebaseOptions } from "firebase/app";
import { getApps, initializeApp } from "firebase/app";

const rawFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function trimFirebaseValue(value: string | undefined) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : undefined;
}

function readFirebaseConfig(): FirebaseOptions {
  return {
    apiKey: trimFirebaseValue(rawFirebaseConfig.apiKey),
    authDomain: trimFirebaseValue(rawFirebaseConfig.authDomain),
    projectId: trimFirebaseValue(rawFirebaseConfig.projectId),
    storageBucket: trimFirebaseValue(rawFirebaseConfig.storageBucket),
    messagingSenderId: trimFirebaseValue(rawFirebaseConfig.messagingSenderId),
    appId: trimFirebaseValue(rawFirebaseConfig.appId),
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
