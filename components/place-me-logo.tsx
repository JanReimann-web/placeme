import Image from "next/image";
import { cn } from "@/lib/utils";

function PlaceMeMark({
  className = "h-14 w-11",
  alt = "PlaceMe logo",
}: {
  className?: string;
  alt?: string;
}) {
  return (
    <span className={cn("relative block shrink-0 overflow-visible", className)}>
      <Image
        src="/brand/logo-mark-vibrant.png"
        alt={alt}
        fill
        sizes="64px"
        className="object-contain drop-shadow-[0_10px_22px_rgba(104,46,214,0.2)]"
      />
    </span>
  );
}

export function PlaceMeLogo({
  className = "",
  wordmarkClassName = "",
  markClassName = "h-14 w-11",
}: {
  className?: string;
  wordmarkClassName?: string;
  markClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <PlaceMeMark className={markClassName} alt="PlaceMe logo" />
      <span
        className={cn(
          "display-type text-[2.35rem] leading-none tracking-[-0.04em] text-[var(--ink-strong)]",
          wordmarkClassName,
        )}
      >
        PlaceMe
      </span>
    </div>
  );
}

export { PlaceMeMark };
