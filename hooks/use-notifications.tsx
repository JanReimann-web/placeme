"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import {
  getBrowserPushToken,
  isPushMessagingConfigured,
  isPushMessagingSupported,
} from "@/firebase/messaging";
import { useAuth } from "@/hooks/use-auth";
import {
  markNotificationRead,
  markNotificationsRead,
  subscribeNotifications,
  upsertNotificationDevice,
} from "@/services/notification-service";
import type { AppNotification } from "@/types/domain";

type NotificationSupport = "unknown" | "supported" | "unsupported";

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  permission: NotificationPermission | "unsupported";
  support: NotificationSupport;
  pushConfigured: boolean;
  requestDeviceNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(
  undefined,
);

function getCurrentPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission;
}

function getLocalDeviceId() {
  if (typeof window === "undefined") {
    return null;
  }

  const storageKey = "placeme-device-id";
  const existing = window.localStorage.getItem(storageKey);

  if (existing) {
    return existing;
  }

  const created = crypto.randomUUID();
  window.localStorage.setItem(storageKey, created);
  return created;
}

async function ensureAppServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();
  const activeRegistration = registrations.find((registration) =>
    registration.active?.scriptURL.endsWith("/sw.js"),
  );

  if (activeRegistration) {
    return activeRegistration;
  }

  return navigator.serviceWorker.register("/sw.js");
}

async function showLocalNotification(notification: AppNotification) {
  if (typeof window === "undefined" || Notification.permission !== "granted") {
    return;
  }

  const title = notification.title;
  const options: NotificationOptions = {
    body: notification.body,
    icon: "/icon",
    badge: "/icon",
    tag: notification.id,
    data: {
      href: notification.href,
      notificationId: notification.id,
      jobId: notification.jobId,
    },
  };

  if ("serviceWorker" in navigator) {
    const registration = await ensureAppServiceWorker();

    if (registration) {
      await registration.showNotification(title, options);
      return;
    }
  }

  const browserNotification = new Notification(title, options);

  browserNotification.onclick = () => {
    if (notification.href) {
      window.location.href = notification.href;
    }
  };
}

export function NotificationsProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const userId = user?.uid ?? null;
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    getCurrentPermission(),
  );
  const [support, setSupport] = useState<NotificationSupport>("unknown");
  const displayedNotificationIds = useRef<Set<string>>(new Set());
  const hasLoadedInitialNotifications = useRef(false);

  useEffect(() => {
    let active = true;

    void isPushMessagingSupported()
      .then((supported) => {
        if (!active) {
          return;
        }

        setSupport(supported ? "supported" : "unsupported");
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setSupport("unsupported");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      return;
    }

    return subscribeNotifications(
      userId,
      (items) => {
        setNotifications(items);
        setLoadedUserId(userId);
        setError(null);
      },
      (nextError) => {
        setNotifications([]);
        setLoadedUserId(userId);
        setError(nextError.message);
      },
    );
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    if (permission !== "granted") {
      return;
    }

    const registerDevice = async () => {
      const deviceId = getLocalDeviceId();

      if (!deviceId) {
        return;
      }

      const registration = await ensureAppServiceWorker();
      const token = registration
        ? await getBrowserPushToken(registration)
        : null;

      await upsertNotificationDevice({
        userId,
        deviceId,
        token,
        permission: "granted",
        notificationsEnabled: true,
      });
    };

    void registerDevice().catch((nextError) => {
      console.error("Failed to register notification device.", nextError);
    });
  }, [permission, userId]);

  useEffect(() => {
    if (permission !== "granted") {
      return;
    }

    if (!hasLoadedInitialNotifications.current) {
      notifications.forEach((notification) => {
        displayedNotificationIds.current.add(notification.id);
      });
      hasLoadedInitialNotifications.current = true;
      return;
    }

    for (const notification of notifications) {
      if (notification.status !== "unread") {
        continue;
      }

      if (displayedNotificationIds.current.has(notification.id)) {
        continue;
      }

      displayedNotificationIds.current.add(notification.id);

      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        continue;
      }

      void showLocalNotification(notification);
    }
  }, [notifications, permission]);

  const value = useMemo<NotificationsContextValue>(() => {
    if (!userId) {
      return {
        notifications: [],
        unreadCount: 0,
        loading: false,
        error: null,
        permission,
        support,
        pushConfigured: isPushMessagingConfigured(),
        async requestDeviceNotifications() {},
        async markAsRead() {},
        async markAllAsRead() {},
      };
    }

    const unreadIds = notifications
      .filter((item) => item.status === "unread")
      .map((item) => item.id);
    const loading = loadedUserId !== userId && !error;

    return {
      notifications,
      unreadCount: unreadIds.length,
      loading,
      error,
      permission,
      support,
      pushConfigured: isPushMessagingConfigured(),
      async requestDeviceNotifications() {
        if (permission === "unsupported") {
          return;
        }

        const nextPermission = await Notification.requestPermission();
        setPermission(nextPermission);

        if (userId) {
          const deviceId = getLocalDeviceId();

          if (deviceId) {
            await upsertNotificationDevice({
              userId,
              deviceId,
              token: null,
              permission: nextPermission,
              notificationsEnabled: nextPermission === "granted",
            });
          }
        }
      },
      async markAsRead(notificationId: string) {
        if (!userId) {
          return;
        }

        await markNotificationRead(notificationId, userId);
      },
      async markAllAsRead() {
        if (!userId) {
          return;
        }

        await markNotificationsRead(unreadIds, userId);
      },
    };
  }, [error, loadedUserId, notifications, permission, support, userId]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error("useNotifications must be used within NotificationsProvider.");
  }

  return context;
}
