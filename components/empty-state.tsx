import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="travel-panel rounded-[28px] p-8 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-sea)]">
        PlaceMe
      </p>
      <h3 className="mt-4 text-2xl font-semibold text-[var(--ink-strong)]">
        {title}
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--ink-soft)]">
        {description}
      </p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--surface-dark)] px-5 py-3 text-sm font-semibold text-[var(--surface-base)] transition hover:opacity-90"
        >
          {actionLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}
