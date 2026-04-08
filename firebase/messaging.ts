"use client";

import { getFirebaseApp } from "@/firebase/config";

const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY?.trim();

export function isPushMessagingConfigured() {
  return Boolean(vapidKey);
}

export async function isPushMessagingSupported() {
  if (typeof window === "undefined") {
    return false;
  }

  const { isSupported } = await import("firebase/messaging");
  return isSupported();
}

export async function getBrowserPushToken(
  serviceWorkerRegistration: ServiceWorkerRegistration,
) {
  if (!vapidKey) {
    return null;
  }

  const supported = await isPushMessagingSupported();

  if (!supported) {
    return null;
  }

  const { getMessaging, getToken } = await import("firebase/messaging");

  return getToken(getMessaging(getFirebaseApp()), {
    vapidKey,
    serviceWorkerRegistration,
  });
}
