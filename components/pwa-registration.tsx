"use client";

import { useEffect } from "react";

export function PwaRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) {
      return;
    }

    const register = async () => {
      try {
        const existingRegistration = await navigator.serviceWorker.getRegistration("/sw.js");

        if (existingRegistration) {
          await existingRegistration.update();
          return;
        }

        await navigator.serviceWorker.register("/sw.js");
      } catch (error) {
        console.error("Failed to register service worker", error);
      }
    };

    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(() => {
        void register();
      });

      return () => window.cancelIdleCallback(id);
    }

    const timeoutId = setTimeout(() => {
      void register();
    }, 1200);

    return () => clearTimeout(timeoutId);
  }, []);

  return null;
}
