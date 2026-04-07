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

  const repeatedItems = useMemo(
    () => [...dockItems, ...dockItems, ...dockItems],
    [dockItems],
  );

  useEffect(() => {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    const positionToMiddle = () => {
      element.scrollLeft = element.scrollWidth / 3;
    };

    const handleScroll = () => {
      const setWidth = element.scrollWidth / 3;

      if (!setWidth) {
        return;
      }

      if (element.scrollLeft < setWidth * 0.45) {
        element.scrollLeft += setWidth;
      } else if (element.scrollLeft > setWidth * 1.55) {
        element.scrollLeft -= setWidth;
      }
    };

    const frameId = requestAnimationFrame(positionToMiddle);
    element.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frameId);
      element.removeEventListener("scroll", handleScroll);
    };
  }, [repeatedItems.length]);

  return (
    <nav
      aria-label="Primary navigation"
      className="travel-panel fixed bottom-4 left-4 right-4 z-40 overflow-hidden rounded-[30px] px-2 py-2 pb-[calc(0.6rem+env(safe-area-inset-bottom))] shadow-[0_26px_60px_rgba(49,34,12,0.16)] md:hidden"
    >
      <div
        ref={scrollRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-1"
      >
        {repeatedItems.map((item, index) => {
          const Icon = item.icon;
          const active =
            item.type === "link" &&
            (pathname === item.href ||
              (item.href !== "/app" && pathname.startsWith(item.href)));
          const className = cn(
            "premium-pressable premium-nav-pill flex min-h-[5rem] min-w-[5.9rem] snap-center flex-col items-center justify-center gap-1 rounded-[22px] px-4 py-3 text-[0.68rem] font-medium leading-none",
            active ? "premium-nav-pill-active" : "",
          );

          if (item.type === "action") {
            return (
              <button
                key={`${item.href}-${index}`}
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
            <Link key={`${item.href}-${index}`} href={item.href} className={className}>
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
