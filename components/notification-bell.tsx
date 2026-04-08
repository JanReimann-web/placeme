"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, ChevronRight } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    loading,
    permission,
    support,
    pushConfigured,
    requestDeviceNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const latestNotifications = notifications.slice(0, 6);

  return (
    <div
      ref={rootRef}
      className={cn("relative shrink-0", open ? "z-[170]" : "z-10")}
    >
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((current) => !current)}
        className="premium-pressable premium-ghost-action relative inline-flex h-11 w-11 items-center justify-center rounded-full sm:h-14 sm:w-14"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute right-2 top-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent-sea)] px-1.5 text-[10px] font-semibold text-white shadow-[0_8px_16px_rgba(18,35,61,0.24)]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="travel-panel fixed left-4 right-4 top-[calc(env(safe-area-inset-top)+5.75rem)] z-[180] mx-auto max-h-[calc(100vh-9rem)] w-auto overflow-y-auto rounded-[28px] p-4 shadow-[0_26px_60px_rgba(48,34,13,0.16)] md:absolute md:left-auto md:right-0 md:top-[calc(100%+0.75rem)] md:max-h-[min(32rem,calc(100vh-8rem))] md:w-[22rem]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-sea)]">
                Notifications
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                {unreadCount > 0
                  ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}`
                  : "Your studio updates will appear here."}
              </p>
            </div>

            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => void markAllAsRead()}
                className="premium-pressable premium-ghost-action inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all
              </button>
            ) : null}
          </div>

          {support === "supported" && permission !== "granted" ? (
            <div className="mt-4 rounded-[22px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-4">
              <p className="text-sm font-semibold text-[var(--ink-strong)]">
                Turn on device alerts
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                Get a notice when a travel set finishes, even if you move away from the app.
              </p>
              <button
                type="button"
                onClick={() => void requestDeviceNotifications()}
                className="premium-pressable premium-action mt-4 inline-flex rounded-full px-4 py-2.5 text-sm font-semibold"
              >
                Enable notifications
              </button>
            </div>
          ) : null}

          {permission === "granted" && !pushConfigured ? (
            <div className="mt-4 rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
              Device alerts are ready in the UI, but web-push still needs a Firebase VAPID key in environment settings.
            </div>
          ) : null}

          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="rounded-[22px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] px-4 py-3 text-sm text-[var(--ink-soft)]">
                Loading updates...
              </div>
            ) : latestNotifications.length ? (
              latestNotifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.href ?? "/app/jobs"}
                  onClick={() => {
                    setOpen(false);
                    void markAsRead(notification.id);
                  }}
                  className={cn(
                    "premium-pressable block rounded-[22px] border px-4 py-3 transition-colors",
                    notification.status === "unread"
                      ? "border-[rgba(64,95,134,0.24)] bg-[rgba(255,255,255,0.82)]"
                      : "border-[var(--line-soft)] bg-[var(--surface-subtle)]",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--ink-strong)]">
                        {notification.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
                        {notification.body}
                      </p>
                    </div>
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ink-muted)]" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-[22px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] px-4 py-5 text-sm leading-6 text-[var(--ink-soft)]">
                No notifications yet.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
