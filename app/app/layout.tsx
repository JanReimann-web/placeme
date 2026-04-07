import { AppDataProvider } from "@/components/app-data-provider";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { NotificationsProvider } from "@/hooks/use-notifications";

export default function PrivateAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AppDataProvider>
        <NotificationsProvider>
          <AppShell>{children}</AppShell>
        </NotificationsProvider>
      </AppDataProvider>
    </ProtectedRoute>
  );
}
