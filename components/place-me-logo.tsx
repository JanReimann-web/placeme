import { useId } from "react";

function PlaceMeMark({ className = "h-12 w-12" }: { className?: string }) {
  const id = useId();
  const goldGradient = `${id}-gold`;
  const irisGradient = `${id}-iris`;

  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={goldGradient} x1="11" y1="6" x2="48" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D7BA84" />
          <stop offset="52%" stopColor="#B68A3D" />
          <stop offset="100%" stopColor="#8A6226" />
        </linearGradient>
        <radialGradient id={irisGradient} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(36 24) rotate(90) scale(11)">
          <stop offset="0%" stopColor="#B6D3F3" />
          <stop offset="58%" stopColor="#38597D" />
          <stop offset="100%" stopColor="#16273B" />
        </radialGradient>
      </defs>
      <path
        d="M11 57V24.8C11 14.42 19.42 6 29.8 6C40.18 6 48.6 14.42 48.6 24.8C48.6 31.5 45.08 37.44 39.8 40.78L29.9 47.1L24.06 37.92L33.3 32.16C36.42 30.16 38.4 26.68 38.4 22.98C38.4 17.12 33.66 12.38 27.8 12.38C21.94 12.38 17.2 17.12 17.2 22.98V42.9L23.46 36.78L30.72 44.2L17.74 57H11Z"
        fill={`url(#${goldGradient})`}
      />
      <circle cx="35.8" cy="23.8" r="12.5" fill="#F3E7CA" />
      <circle cx="35.8" cy="23.8" r="8.9" fill={`url(#${irisGradient})`} />
      <circle cx="35.8" cy="23.8" r="4.2" fill="#1B2230" />
      <circle cx="38.4" cy="20.7" r="1.55" fill="#FFFFFF" />
      <circle cx="31.1" cy="17.5" r="2.15" fill="#F8E7BC" fillOpacity="0.88" />
      <circle cx="46.9" cy="13.5" r="2.8" fill="#F4D291" fillOpacity="0.92" />
    </svg>
  );
}

export function PlaceMeLogo({
  className = "",
  wordmarkClassName = "",
  markClassName = "h-12 w-12",
}: {
  className?: string;
  wordmarkClassName?: string;
  markClassName?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <PlaceMeMark className={markClassName} />
      <span className={`display-type text-[2.35rem] leading-none tracking-[-0.04em] text-[#16110d] ${wordmarkClassName}`}>
        PlaceMe
      </span>
    </div>
  );
}

export { PlaceMeMark };
