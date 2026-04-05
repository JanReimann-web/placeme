import { EmptyState } from "@/components/empty-state";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-5 py-20">
      <EmptyState
        title="Page not found"
        description="The route you tried to open does not exist in this PlaceMe MVP."
        actionHref="/app"
        actionLabel="Go to dashboard"
      />
    </main>
  );
}
