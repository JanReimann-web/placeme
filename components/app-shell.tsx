"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { MobileBottomDock } from "@/components/mobile-bottom-dock";
import { NotificationBell } from "@/components/notification-bell";
import { PlaceMeLogo } from "@/components/place-me-logo";
import { useAuth } from "@/hooks/use-auth";
import { appNavigationItems } from "@/lib/app-navigation";
import { cn } from "@/lib/utils";

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
    <div className="min-h-screen [--mobile-dock-gap:1.5rem] pb-[calc(7rem+var(--mobile-dock-gap)+env(safe-area-inset-bottom))] md:pb-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 md:gap-8 md:px-8 md:py-8">
        <header className="travel-panel overflow-visible rounded-[28px] px-4 py-4 sm:rounded-[32px] sm:px-6 sm:py-5">
          <div className="flex flex-wrap items-center gap-3 md:justify-between md:gap-4">
            <PlaceMeLogo
              className="min-w-0 flex-1 basis-[11rem]"
              markClassName="h-10 w-8 sm:h-14 sm:w-10"
              wordmarkClassName="truncate text-[2rem] sm:text-[3rem]"
            />

            <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
              <NotificationBell />

              <UserAvatar
                photoURL={user?.photoURL}
                fallback={user?.displayName?.slice(0, 1) ?? "P"}
                sizeClassName="h-11 w-11 sm:h-14 sm:w-14"
              />
            </div>
          </div>

          <nav className="mt-5 hidden grid-cols-[repeat(5,minmax(0,1fr))_auto] gap-3 md:grid">
            {appNavigationItems.map((item) => {
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

            <button
              type="button"
              onClick={() => void signOutUser()}
              className="premium-pressable premium-ghost-action inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </nav>
        </header>

        <main className="min-w-0 md:pb-0">{children}</main>
      </div>

      <MobileBottomDock
        items={appNavigationItems}
        pathname={pathname}
        onSignOut={() => void signOutUser()}
      />
    </div>
  );
}
