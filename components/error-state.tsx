import Link from "next/link";
import { AlertTriangle, ArrowRight, RefreshCw } from "lucide-react";

export function ErrorState({
  title,
  description,
  actionHref,
  actionLabel,
  onRetry,
  retryLabel = "Try again",
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div className="travel-panel rounded-[30px] p-5 text-center sm:rounded-[32px] sm:p-8">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[22px] bg-rose-50 text-rose-600 shadow-[var(--shadow-card)] dark:bg-rose-950/40 dark:text-rose-300 sm:h-16 sm:w-16 sm:rounded-[24px]">
        <AlertTriangle className="h-6 w-6 sm:h-7 sm:w-7" />
      </div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.32em] text-rose-500">
        Something needs attention
      </p>
      <h3 className="mt-4 text-[1.7rem] font-semibold text-[var(--ink-strong)] sm:text-2xl">
        {title}
      </h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--ink-soft)]">
        {description}
      </p>

      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="premium-pressable premium-action inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold sm:w-auto"
          >
            <RefreshCw className="h-4 w-4" />
            {retryLabel}
          </button>
        ) : null}
        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="premium-pressable premium-ghost-action inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold sm:w-auto"
          >
            {actionLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
