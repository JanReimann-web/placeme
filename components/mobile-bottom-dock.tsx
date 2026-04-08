"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { LogOut } from "lucide-react";
import type { AppNavigationItem } from "@/lib/app-navigation";
import { cn } from "@/lib/utils";

type DockItem =
  | (AppNavigationItem & { type: "link" })
  | {
      href: "logout";
      label: "Logout";
      description: string;
      icon: typeof LogOut;
      type: "action";
    };

const MOBILE_DOCK_SCROLL_KEY = "placeme-mobile-dock-scroll-left";

export function MobileBottomDock({
  items,
  pathname,
  onSignOut,
}: {
  items: AppNavigationItem[];
  pathname: string;
  onSignOut: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const dockItems = useMemo<DockItem[]>(
    () => [
      ...items.map((item) => ({ ...item, type: "link" as const })),
      {
        href: "logout",
        label: "Logout",
        description: "Sign out of PlaceMe.",
        icon: LogOut,
        type: "action" as const,
      },
    ],
    [items],
  );

  useEffect(() => {
    const element = scrollRef.current;

    if (!element || typeof window === "undefined") {
      return;
    }

    const savedScrollLeft = window.sessionStorage.getItem(MOBILE_DOCK_SCROLL_KEY);

    if (savedScrollLeft) {
      const parsedScrollLeft = Number(savedScrollLeft);

      if (Number.isFinite(parsedScrollLeft)) {
        element.scrollLeft = parsedScrollLeft;
      }
    }

    const handleScroll = () => {
      window.sessionStorage.setItem(
        MOBILE_DOCK_SCROLL_KEY,
        String(element.scrollLeft),
      );
    };

    element.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      element.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 bottom-4 z-[140] px-4 md:hidden">
      <nav
        aria-label="Primary navigation"
        className="travel-panel pointer-events-auto mx-auto w-full max-w-7xl overflow-hidden rounded-[30px] px-2 py-2 pb-[calc(0.6rem+env(safe-area-inset-bottom))] shadow-[0_26px_60px_rgba(49,34,12,0.2)]"
      >
        <div
          ref={scrollRef}
          className="no-scrollbar flex gap-3 overflow-x-auto overscroll-x-contain px-1"
        >
          {dockItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.type === "link" &&
            (pathname === item.href ||
              (item.href !== "/app" && pathname.startsWith(item.href)));
          const className = cn(
            "premium-pressable premium-nav-pill flex min-h-[5rem] min-w-[5.9rem] flex-col items-center justify-center gap-1 rounded-[22px] px-4 py-3 text-[0.68rem] font-medium leading-none",
            active ? "premium-nav-pill-active" : "",
          );

          if (item.type === "action") {
            return (
              <button
                key={item.href}
                type="button"
                onClick={onSignOut}
                className={className}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          }

          return (
            <Link key={item.href} href={item.href} className={className}>
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        </div>
      </nav>
    </div>
  );
}
