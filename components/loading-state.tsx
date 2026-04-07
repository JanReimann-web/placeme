import { Compass, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingState({
  label = "Loading PlaceMe",
  fullPage = false,
}: {
  label?: string;
  fullPage?: boolean;
}) {
  return (
    <div
      className={cn(
        "travel-panel flex flex-col items-center justify-center gap-5 rounded-[30px] p-6 text-center sm:gap-6 sm:rounded-[32px] sm:p-10",
        fullPage && "min-h-screen rounded-none border-0 bg-transparent shadow-none",
      )}
    >
      <div className="travel-gradient flex h-16 w-16 items-center justify-center rounded-[24px] p-4 sm:h-18 sm:w-18 sm:rounded-[28px] sm:p-5">
        <div className="relative">
          <Compass className="h-7 w-7 animate-pulse text-[var(--accent-sea)] sm:h-8 sm:w-8" />
          <Sparkles className="absolute -right-2 -top-2 h-4 w-4 animate-bounce text-[var(--accent-sand)]" />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-sea)]">
          PlaceMe
        </p>
        <p className="text-[0.95rem] font-semibold text-[var(--ink-strong)] sm:text-base">{label}</p>
        <p className="text-sm leading-7 text-[var(--ink-soft)]">
          Preparing your private travel studio with profile, job, and scene data.
        </p>
      </div>

      <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-3">
        {["Profile library", "Scene pack", "Output history"].map((item) => (
          <div
            key={item}
            className="rounded-[24px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-4 text-left"
          >
            <div className="h-2 w-16 animate-pulse rounded-full bg-[var(--line-soft)]" />
            <p className="mt-4 text-sm font-semibold text-[var(--ink-strong)]">{item}</p>
            <div className="mt-3 h-2 w-full animate-pulse rounded-full bg-[var(--line-soft)]" />
            <div className="mt-2 h-2 w-2/3 animate-pulse rounded-full bg-[var(--line-soft)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
