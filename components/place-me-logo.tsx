import { cn } from "@/lib/utils";

function PlaceMeMarkSvg({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 72 92"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn("shrink-0 overflow-visible", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="placeme-mark-gradient" x1="18" y1="10" x2="56" y2="80">
          <stop offset="0" stopColor="#E5DBFF" />
          <stop offset="0.32" stopColor="#B79BF7" />
          <stop offset="1" stopColor="#6E4ED3" />
        </linearGradient>
        <linearGradient id="placeme-mark-stem" x1="12" y1="18" x2="30" y2="88">
          <stop offset="0" stopColor="#8B67F0" />
          <stop offset="1" stopColor="#4C3690" />
        </linearGradient>
        <radialGradient id="placeme-mark-lens" cx="0.4" cy="0.35" r="0.9">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.38" stopColor="#D4ECFF" />
          <stop offset="0.7" stopColor="#6C93C6" />
          <stop offset="1" stopColor="#1B243E" />
        </radialGradient>
      </defs>

      <path
        d="M16 16C16 11.582 19.582 8 24 8H27.4C36.073 8 44.222 12.136 49.342 19.14L50.444 20.646C55.256 27.227 56.67 35.684 54.26 43.455C52.655 48.631 49.361 53.125 44.904 56.216L29.4 66.97V57.266L37.59 51.59C40.47 49.595 42.6 46.688 43.634 43.335C45.185 38.303 44.263 32.826 41.12 28.487L40.018 26.98C36.212 21.775 30.154 18.694 23.706 18.694H20.2V83.158H10.4V16H16Z"
        fill="url(#placeme-mark-stem)"
      />
      <path
        d="M49.9 10.2C60.98 10.2 69.8 19.074 69.8 30.1C69.8 41.126 60.98 50 49.9 50C38.874 50 30 41.126 30 30.1C30 19.074 38.874 10.2 49.9 10.2Z"
        fill="url(#placeme-mark-gradient)"
        stroke="rgba(255,255,255,0.65)"
        strokeWidth="1.4"
      />
      <circle cx="49.9" cy="30.1" r="11.4" fill="url(#placeme-mark-lens)" />
      <circle cx="46.8" cy="27.2" r="2.5" fill="rgba(255,255,255,0.86)" />
      <circle cx="58.8" cy="15.6" r="3.8" fill="#EEE7FF" />
      <circle cx="61.8" cy="35.2" r="2.7" fill="#F8F4FF" />
    </svg>
  );
}

function PlaceMeMark({
  className = "h-14 w-11",
  alt = "PlaceMe logo",
}: {
  className?: string;
  alt?: string;
}) {
  return (
    <PlaceMeMarkSvg
      className={cn(
        "drop-shadow-[0_10px_20px_rgba(97,72,167,0.14)]",
        className,
      )}
      title={alt}
    />
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

export { PlaceMeMark, PlaceMeMarkSvg };
