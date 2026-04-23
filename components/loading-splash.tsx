import { PlaceMeLogo } from "@/components/place-me-logo";
import { cn } from "@/lib/utils";

export function LoadingSplash({
  label = "Loading PlaceMe",
  fullPage = false,
}: {
  label?: string;
  fullPage?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        fullPage ? "min-h-screen px-6 py-10" : "min-h-[16rem] px-6 py-10",
      )}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <PlaceMeLogo
          className="justify-center"
          markClassName="h-20 w-16 sm:h-24 sm:w-[4.5rem]"
          wordmarkClassName="!text-[3.35rem] sm:!text-[4rem]"
        />
        <p className="text-sm font-medium tracking-[0.02em] text-[var(--ink-soft)]">
          {label}
        </p>
      </div>
    </div>
  );
}
