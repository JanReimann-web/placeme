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
    <div className="travel-panel rounded-[30px] p-6 text-center sm:rounded-[32px] sm:p-10">
      <div className="travel-gradient mx-auto flex h-14 w-14 items-center justify-center rounded-[22px] sm:h-16 sm:w-16 sm:rounded-[24px]">
        <Compass className="h-6 w-6 text-[var(--accent-sea)] sm:h-7 sm:w-7" />
      </div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-sea)]">
        PlaceMe
      </p>
      <h3 className="mt-4 text-[1.7rem] font-semibold text-[var(--ink-strong)] sm:text-2xl">
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
