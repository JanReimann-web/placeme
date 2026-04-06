"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/error-state";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center">
      <ErrorState
        title="This PlaceMe view hit an unexpected error"
        description="The app structure, Firebase integration, and generation service layer are still intact. Reload this view to continue."
        onRetry={reset}
        retryLabel="Reload this view"
        actionHref="/app"
        actionLabel="Go to overview"
      />
    </div>
  );
}
