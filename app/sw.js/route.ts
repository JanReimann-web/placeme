import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function readFirebaseEnvValue(name: keyof NodeJS.ProcessEnv) {
  const value = process.env[name];

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : undefined;
}

export async function GET() {
  const firebaseConfig = {
    apiKey: readFirebaseEnvValue("NEXT_PUBLIC_FIREBASE_API_KEY"),
    authDomain: readFirebaseEnvValue("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: readFirebaseEnvValue("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: readFirebaseEnvValue("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: readFirebaseEnvValue("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    appId: readFirebaseEnvValue("NEXT_PUBLIC_FIREBASE_APP_ID"),
  };

  const messagingConfigured = Object.values(firebaseConfig).every(Boolean);

  const script = `
    const CACHE_NAME = "placeme-shell-v12";
    const APP_ASSETS = [
      "/manifest.webmanifest?v=brand-v2",
      "/favicon.ico",
      "/icon.png?v=brand-v2",
      "/icons/apple-touch-icon-v2.png",
      "/icons/icon-192-v2.png",
      "/icons/icon-512-v2.png",
      "/icons/icon-192-maskable-v2.png",
      "/icons/icon-512-maskable-v2.png",
    ];
    const APP_ASSET_PATHS = APP_ASSETS.map((asset) => new URL(asset, self.location.origin).pathname);

    self.addEventListener("install", (event) => {
      event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS)),
      );
      self.skipWaiting();
    });

    self.addEventListener("activate", (event) => {
      event.waitUntil(
        caches.keys().then((keys) =>
          Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
        ),
      );
      self.clients.claim();
    });

    self.addEventListener("message", (event) => {
      if (event.data?.type === "SKIP_WAITING") {
        self.skipWaiting();
      }
    });

    self.addEventListener("fetch", (event) => {
      if (event.request.method !== "GET") {
        return;
      }

      const url = new URL(event.request.url);

      if (url.origin !== self.location.origin) {
        return;
      }

      const isStaticAsset =
        APP_ASSET_PATHS.includes(url.pathname) ||
        url.pathname.startsWith("/_next/static/");

      if (
        event.request.mode === "navigate" ||
        url.pathname.startsWith("/__/") ||
        !isStaticAsset
      ) {
        return;
      }

      event.respondWith(
        caches.match(event.request).then((cached) => {
          if (cached) {
            return cached;
          }

          return fetch(event.request)
            .then((response) => {
              if (response.ok) {
                const copy = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
              }
              return response;
            })
            .catch(() => caches.match(event.request));
        }),
      );
    });

    ${
      messagingConfigured
        ? `
    importScripts("https://www.gstatic.com/firebasejs/12.11.0/firebase-app-compat.js");
    importScripts("https://www.gstatic.com/firebasejs/12.11.0/firebase-messaging-compat.js");

    firebase.initializeApp(${JSON.stringify(firebaseConfig)});
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      const notification = payload.notification || {};
      const data = payload.data || {};
      const title = notification.title || data.title || "PlaceMe";
      const body = notification.body || data.body || "Your travel photos are ready.";
      const href = data.href || "/app/jobs";

      self.registration.showNotification(title, {
        body,
        icon: "/icon",
        badge: "/icon",
        tag: data.notificationId || data.jobId || "placeme-notification",
        data: {
          href,
          notificationId: data.notificationId || "",
          jobId: data.jobId || "",
        },
      });
    });
    `
        : ""
    }

    self.addEventListener("notificationclick", (event) => {
      event.notification.close();

      const href = event.notification.data?.href || "/app/jobs";

      event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
          for (const client of clientList) {
            if ("focus" in client) {
              client.navigate(href);
              return client.focus();
            }
          }

          if (clients.openWindow) {
            return clients.openWindow(href);
          }

          return undefined;
        }),
      );
    });
  `;

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Service-Worker-Allowed": "/",
    },
  });
}
