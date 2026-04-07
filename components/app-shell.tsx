"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  FolderHeart,
  GalleryVerticalEnd,
  Home,
  LogOut,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { PlaceMeLogo } from "@/components/place-me-logo";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/app",
    label: "Home",
    description: "Overview of your private travel studio.",
    icon: Home,
  },
  {
    href: "/app/profiles",
    label: "Profiles",
    description: "Build private self and companion reference libraries.",
    icon: FolderHeart,
  },
  {
    href: "/app/generate",
    label: "Generate",
    description: "Create a guided destination photo set.",
    icon: WandSparkles,
  },
  {
    href: "/app/jobs",
    label: "Jobs",
    description: "Monitor pending, processing, and completed generations.",
    icon: Sparkles,
  },
  {
    href: "/app/gallery",
    label: "Gallery",
    description: "Review finished outputs across destinations and styles.",
    icon: GalleryVerticalEnd,
  },
];

function getCurrentPageMeta(pathname: string) {
  const activeItem =
    navItems.find(
      (item) =>
        pathname === item.href ||
        (item.href !== "/app" && pathname.startsWith(item.href)),
    ) ?? navItems[0];

  return {
    title: activeItem.label,
    description: activeItem.description,
  };
}

function UserAvatar({
  photoURL,
  fallback,
  sizeClassName,
}: {
  photoURL?: string | null;
  fallback: string;
  sizeClassName: string;
}) {
  if (photoURL) {
    return (
      <Image
        src={photoURL}
        alt="PlaceMe user"
        width={56}
        height={56}
        sizes="56px"
        className={cn("rounded-full object-cover", sizeClassName)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-[var(--surface-dark)] font-semibold text-[var(--surface-base)]",
        sizeClassName,
      )}
    >
      {fallback}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOutUser } = useAuth();
  const pageMeta = getCurrentPageMeta(pathname);

  return (
    <div className="min-h-screen pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:pb-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 md:gap-8 md:px-8 md:py-8">
        <header className="travel-panel rounded-[28px] px-4 py-4 sm:rounded-[32px] sm:px-6 sm:py-5">
          <div className="flex items-start justify-between gap-3 md:items-center md:gap-4">
            <PlaceMeLogo
              className="min-w-0"
              markClassName="h-10 w-8 sm:h-14 sm:w-10"
              wordmarkClassName="truncate text-[2rem] sm:text-[3rem]"
            />

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                aria-label="Notifications"
                className="premium-pressable premium-ghost-action flex h-11 w-11 items-center justify-center rounded-full text-sm md:hidden"
              >
                <Bell className="h-4 w-4" />
              </button>

              <button
                type="button"
                aria-label="Notifications"
                className="premium-pressable premium-ghost-action hidden h-14 w-14 items-center justify-center rounded-full md:flex"
              >
                <Bell className="h-5 w-5" />
              </button>

              <UserAvatar
                photoURL={user?.photoURL}
                fallback={user?.displayName?.slice(0, 1) ?? "P"}
                sizeClassName="h-11 w-11 sm:h-14 sm:w-14"
              />

              <button
                type="button"
                onClick={() => void signOutUser()}
                aria-label="Sign out"
                className="premium-pressable premium-ghost-action inline-flex h-11 w-11 items-center justify-center rounded-full lg:hidden"
              >
                <LogOut className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => void signOutUser()}
                className="premium-pressable premium-ghost-action hidden rounded-full px-4 py-3 text-sm font-medium lg:inline-flex"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-start justify-between gap-4 md:hidden">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--accent-sea)]">
                Travel studio
              </p>
              <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[var(--ink-strong)]">
                {pageMeta.title}
              </p>
              <p className="mt-1 max-w-[15rem] text-xs leading-5 text-[var(--ink-soft)]">
                {pageMeta.description}
              </p>
            </div>
          </div>

          <nav className="mt-5 hidden grid-cols-5 gap-3 md:grid">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                (item.href !== "/app" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "premium-pressable premium-nav-pill flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium",
                    active
                      ? "premium-nav-pill-active"
                      : "",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="min-w-0">{children}</main>
      </div>

      <nav className="travel-panel fixed inset-x-3 bottom-3 z-30 grid grid-cols-5 rounded-[26px] p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_24px_40px_rgba(49,34,12,0.14)] md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/app" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "premium-pressable premium-nav-pill flex min-h-[3.75rem] flex-col items-center justify-center gap-1 rounded-[20px] px-1.5 py-2.5 text-[10px] font-medium",
                active
                  ? "premium-nav-pill-active"
                  : "",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
