"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Camera,
  FolderHeart,
  GalleryVerticalEnd,
  LayoutDashboard,
  LogOut,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/app", label: "Overview", icon: LayoutDashboard },
  { href: "/app/profiles", label: "Profiles", icon: FolderHeart },
  { href: "/app/generate", label: "Generate", icon: WandSparkles },
  { href: "/app/jobs", label: "Jobs", icon: Sparkles },
  { href: "/app/gallery", label: "Gallery", icon: GalleryVerticalEnd },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOutUser } = useAuth();

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-4 md:px-6 md:py-6">
        <aside className="hidden w-72 shrink-0 md:block">
          <div className="travel-panel sticky top-6 rounded-[32px] p-6">
            <div className="travel-gradient rounded-[28px] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-dark)] text-[var(--surface-base)]">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-sea)]">
                    PlaceMe
                  </p>
                  <p className="display-type text-3xl leading-none text-[var(--ink-strong)]">
                    Travel Studio
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
                Build private profile libraries and test identity consistency across premium travel scene sets.
              </p>
            </div>

            <nav className="mt-6 space-y-2">
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
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                      active
                        ? "bg-[var(--surface-dark)] text-[var(--surface-base)]"
                        : "text-[var(--ink-soft)] hover:bg-[var(--surface-strong)] hover:text-[var(--ink-strong)]",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-8 rounded-[24px] border border-[var(--line-soft)] bg-[var(--surface-strong)] p-4">
              <div className="flex items-center gap-3">
                {user?.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName ?? "PlaceMe user"}
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--surface-dark)] text-sm font-semibold text-[var(--surface-base)]">
                    {user?.displayName?.slice(0, 1) ?? "P"}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--ink-strong)]">
                    {user?.displayName ?? "PlaceMe user"}
                  </p>
                  <p className="truncate text-xs text-[var(--ink-soft)]">
                    {user?.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void signOutUser()}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--line-soft)] px-4 py-3 text-sm font-medium text-[var(--ink-soft)] transition hover:border-[var(--line-strong)] hover:text-[var(--ink-strong)]"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="rounded-[32px] pb-4 md:pb-0">{children}</div>
        </div>
      </div>

      <nav className="travel-panel fixed inset-x-4 bottom-4 z-30 grid grid-cols-5 rounded-[28px] p-2 md:hidden">
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
                "flex flex-col items-center justify-center gap-1 rounded-[22px] px-2 py-3 text-[11px] font-medium",
                active
                  ? "bg-[var(--surface-dark)] text-[var(--surface-base)]"
                  : "text-[var(--ink-soft)]",
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
