"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bell, CheckCheck, ChevronRight, Trash2, X } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const router = useRouter();
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
    deleteNotification,
  } = useNotifications();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const desktopPanelRef = useRef<HTMLDivElement | null>(null);
  const mobilePanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        rootRef.current?.contains(target) ||
        desktopPanelRef.current?.contains(target) ||
        mobilePanelRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!open || typeof window === "undefined") {
      return;
    }

    if (window.matchMedia("(min-width: 768px)").matches) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const panelContent = (
    <div className="flex h-full min-h-0 flex-col">
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

        <div className="flex items-center gap-2">
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

          <button
            type="button"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
            className="premium-pressable premium-ghost-action inline-flex h-10 w-10 items-center justify-center rounded-full md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
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

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
        {loading ? (
          <div className="rounded-[22px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] px-4 py-3 text-sm text-[var(--ink-soft)]">
            Loading updates...
          </div>
        ) : notifications.length ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
              key={notification.id}
                className={cn(
                  "rounded-[22px] border px-4 py-3 transition-colors",
                  notification.status === "unread"
                    ? "border-[rgba(64,95,134,0.24)] bg-[rgba(255,255,255,0.82)]"
                    : "border-[var(--line-soft)] bg-[var(--surface-subtle)]",
                )}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      void markAsRead(notification.id);
                      router.push(notification.href ?? "/app/jobs");
                    }}
                    className="premium-pressable min-w-0 flex-1 text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--ink-strong)]">
                          {notification.title}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
                          {notification.body}
                        </p>
                      </div>
                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ink-muted)]" />
                    </div>
                  </button>

                  <button
                    type="button"
                    aria-label="Delete notification"
                    onClick={() => void deleteNotification(notification.id)}
                    className="premium-pressable premium-ghost-action inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[22px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] px-4 py-5 text-sm leading-6 text-[var(--ink-soft)]">
            No notifications yet.
          </div>
        )}
      </div>
    </div>
  );

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
        <>
          <div
            ref={desktopPanelRef}
            className="travel-panel absolute right-0 top-[calc(100%+0.75rem)] z-[180] hidden h-[min(34rem,calc(100vh-8rem))] w-[22rem] overflow-hidden rounded-[28px] p-4 shadow-[0_26px_60px_rgba(48,34,13,0.16)] md:block"
          >
            {panelContent}
          </div>

          {typeof document !== "undefined"
            ? createPortal(
                <div className="fixed inset-0 z-[260] md:hidden">
                  <button
                    type="button"
                    aria-label="Close notifications"
                    onClick={() => setOpen(false)}
                    className="absolute inset-0 bg-[rgba(23,13,48,0.24)] backdrop-blur-[2px]"
                  />

                  <div className="relative flex min-h-full items-start justify-center px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-[calc(env(safe-area-inset-top)+4.75rem)]">
                    <div
                      ref={mobilePanelRef}
                      role="dialog"
                      aria-modal="true"
                      aria-label="Notifications"
                      className="travel-panel flex h-[calc(100dvh-7rem-env(safe-area-inset-bottom))] w-full max-w-[22rem] min-h-0 flex-col overflow-hidden rounded-[28px] p-4 shadow-[0_26px_60px_rgba(48,34,13,0.16)]"
                    >
                      {panelContent}
                    </div>
                  </div>
                </div>,
                document.body,
              )
            : null}
        </>
      ) : null}
    </div>
  );
}
