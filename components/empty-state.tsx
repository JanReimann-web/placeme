import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

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
    <div className="travel-panel rounded-[32px] p-8 text-center sm:p-10">
      <div className="travel-gradient mx-auto flex h-16 w-16 items-center justify-center rounded-[24px]">
        <Compass className="h-7 w-7 text-[var(--accent-sea)]" />
      </div>
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
          className="premium-pressable premium-action mx-auto mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold sm:w-auto"
        >
          {actionLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}
