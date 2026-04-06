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
        "travel-panel flex flex-col items-center justify-center gap-6 rounded-[32px] p-8 text-center sm:p-10",
        fullPage && "min-h-screen rounded-none border-0 bg-transparent shadow-none",
      )}
    >
      <div className="travel-gradient flex h-18 w-18 items-center justify-center rounded-[28px] p-5">
        <div className="relative">
          <Compass className="h-8 w-8 animate-pulse text-[var(--accent-sea)]" />
          <Sparkles className="absolute -right-2 -top-2 h-4 w-4 animate-bounce text-[var(--accent-sand)]" />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-sea)]">
          PlaceMe
        </p>
        <p className="text-base font-semibold text-[var(--ink-strong)]">{label}</p>
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
