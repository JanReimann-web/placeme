"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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

  const updateScrollAffordances = () => {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    const maxScrollLeft = Math.max(0, element.scrollWidth - element.clientWidth);
    const threshold = 8;

    setCanScrollLeft(element.scrollLeft > threshold);
    setCanScrollRight(element.scrollLeft < maxScrollLeft - threshold);
  };

  const scrollDock = (direction: "left" | "right") => {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    const distance = Math.max(element.clientWidth * 0.72, 180);

    element.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

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
      updateScrollAffordances();
    };

    const handleResize = () => {
      updateScrollAffordances();
    };

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            updateScrollAffordances();
          })
        : null;

    resizeObserver?.observe(element);
    element.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    updateScrollAffordances();

    return () => {
      resizeObserver?.disconnect();
      element.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [dockItems.length]);

  return (
    <div className="fixed inset-x-0 bottom-4 z-[140] px-4 md:hidden">
      <nav
        aria-label="Primary navigation"
        className="travel-panel pointer-events-auto mx-auto w-full max-w-7xl overflow-hidden rounded-[30px] px-2 py-2 pb-[calc(0.6rem+env(safe-area-inset-bottom))] shadow-[0_26px_60px_rgba(49,34,12,0.2)]"
      >
        {canScrollLeft ? (
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-1">
            <div className="flex h-8 w-8 items-center justify-center text-[var(--surface-dark)]">
              <ChevronLeft className="h-6 w-6 stroke-[2.6]" />
            </div>
          </div>
        ) : null}

        {canScrollRight ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 flex items-center pr-1">
            <div className="flex h-8 w-8 items-center justify-center text-[var(--surface-dark)]">
              <ChevronRight className="h-6 w-6 stroke-[2.6]" />
            </div>
          </div>
        ) : null}

        {canScrollLeft ? (
          <button
            type="button"
            aria-label="Show previous navigation items"
            onClick={() => scrollDock("left")}
            className="absolute inset-y-0 left-0 z-20 w-16"
          />
        ) : null}

        {canScrollRight ? (
          <button
            type="button"
            aria-label="Show more navigation items"
            onClick={() => scrollDock("right")}
            className="absolute inset-y-0 right-0 z-20 w-16"
          />
        ) : null}

        <div
          ref={scrollRef}
          className="no-scrollbar flex gap-3 overflow-x-auto overscroll-x-contain px-10"
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
