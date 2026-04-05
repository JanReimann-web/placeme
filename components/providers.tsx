"use client";

import type { PropsWithChildren } from "react";
import { PwaRegistration } from "@/components/pwa-registration";
import { AuthProvider } from "@/hooks/use-auth";

export function Providers({ children }: PropsWithChildren) {
  return (
    <AuthProvider>
      <PwaRegistration />
      {children}
    </AuthProvider>
  );
}
