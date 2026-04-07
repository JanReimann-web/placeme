"use client";

import { useEffect } from "react";

export function PwaRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) {
      return;
    }

    let cancelled = false;
    let hasReloaded = false;

    const triggerReload = () => {
      if (cancelled || hasReloaded) {
        return;
      }

      hasReloaded = true;
      window.location.reload();
    };

    const attachUpdateHandlers = (registration: ServiceWorkerRegistration) => {
      const promoteWorker = (worker: ServiceWorker | null) => {
        if (!worker) {
          return;
        }

        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            worker.postMessage({ type: "SKIP_WAITING" });
          }
        });
      };

      promoteWorker(registration.installing);
      registration.addEventListener("updatefound", () => {
        promoteWorker(registration.installing);
      });
    };

    const register = async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        const activeSwRegistration = registrations.find((registration) =>
          registration.active?.scriptURL.endsWith("/sw.js"),
        );

        await Promise.all(
          registrations
            .filter((registration) => registration !== activeSwRegistration)
            .map((registration) => registration.unregister()),
        );

        if (activeSwRegistration) {
          attachUpdateHandlers(activeSwRegistration);
          await activeSwRegistration.update();
          return;
        }

        const registration = await navigator.serviceWorker.register("/sw.js");
        attachUpdateHandlers(registration);
      } catch (error) {
        console.error("Failed to register service worker", error);
      }
    };

    navigator.serviceWorker.addEventListener("controllerchange", triggerReload);

    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(() => {
        void register();
      });

      return () => {
        cancelled = true;
        navigator.serviceWorker.removeEventListener("controllerchange", triggerReload);
        window.cancelIdleCallback(id);
      };
    }

    const timeoutId = setTimeout(() => {
      void register();
    }, 1200);

    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener("controllerchange", triggerReload);
      clearTimeout(timeoutId);
    };
  }, []);

  return null;
}
