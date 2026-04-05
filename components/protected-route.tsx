"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { useAuth } from "@/hooks/use-auth";

export function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, user, isConfigured } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated" && isConfigured) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isConfigured, pathname, router, status]);

  if (!isConfigured) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-5 py-20">
        <EmptyState
          title="Firebase setup required"
          description="Add your Firebase environment variables to enable Google sign-in, Firestore, and Storage."
        />
      </div>
    );
  }

  if (status === "loading" || !user) {
    return <LoadingState fullPage label="Checking your PlaceMe session" />;
  }

  return <>{children}</>;
}
