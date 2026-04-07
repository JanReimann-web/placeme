import Image from "next/image";

function PlaceMeMark({
  className = "h-12 w-auto",
  alt = "PlaceMe logo",
}: {
  className?: string;
  alt?: string;
}) {
  return (
    <Image
      src="/brand/logo-mark-cropped.png"
      alt={alt}
      aria-hidden={alt === ""}
      width={552}
      height={764}
      className={`shrink-0 object-contain ${className}`}
      sizes="(max-width: 640px) 32px, 40px"
    />
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
      <PlaceMeMark className={markClassName} alt="" />
      <span className={`display-type text-[2.35rem] leading-none tracking-[-0.04em] text-[#16110d] ${wordmarkClassName}`}>
        PlaceMe
      </span>
    </div>
  );
}

export { PlaceMeMark };
