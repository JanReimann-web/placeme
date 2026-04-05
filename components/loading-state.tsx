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
        "flex flex-col items-center justify-center gap-4 rounded-[28px] border border-[var(--line-soft)] bg-[var(--surface-elevated)] p-10 text-center shadow-[var(--shadow-card)]",
        fullPage && "min-h-screen rounded-none border-0 bg-transparent shadow-none",
      )}
    >
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-[var(--line-soft)] border-t-[var(--accent-sea)]" />
      <p className="text-sm text-[var(--ink-soft)]">{label}</p>
    </div>
  );
}
