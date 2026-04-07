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

  return (
    <div className="min-h-screen pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:pb-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 md:gap-8 md:px-8 md:py-8">
        <header className="travel-panel rounded-[32px] px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <PlaceMeLogo
              className="min-w-0"
              markClassName="h-12 w-9 sm:h-14 sm:w-10"
              wordmarkClassName="truncate text-[2.55rem] sm:text-[3rem]"
            />

            <div className="flex items-center gap-3">
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
                sizeClassName="h-12 w-12 sm:h-14 sm:w-14"
              />

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

      <nav className="travel-panel fixed inset-x-4 bottom-4 z-30 grid grid-cols-5 rounded-[28px] p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:hidden">
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
                "premium-pressable premium-nav-pill flex flex-col items-center justify-center gap-1 rounded-[22px] px-2 py-3 text-[11px] font-medium",
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
