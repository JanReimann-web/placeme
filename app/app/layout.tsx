import { AppDataProvider } from "@/components/app-data-provider";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/protected-route";

export default function PrivateAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AppDataProvider>
        <AppShell>{children}</AppShell>
      </AppDataProvider>
    </ProtectedRoute>
  );
}
