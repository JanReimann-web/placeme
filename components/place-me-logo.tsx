function PlaceMeMark({
  className = "h-12 w-9",
  alt = "PlaceMe logo",
}: {
  className?: string;
  alt?: string;
}) {
  return (
    // This tiny static brand mark renders more reliably than next/image here.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/logo-mark-cropped.png"
      alt={alt}
      aria-hidden={alt === ""}
      width={552}
      height={764}
      className={`shrink-0 object-contain ${className}`}
      sizes="(max-width: 640px) 36px, 40px"
      loading={alt === "" ? "eager" : "lazy"}
      fetchPriority={alt === "" ? "high" : "auto"}
      decoding="async"
    />
  );
}

export function PlaceMeLogo({
  className = "",
  wordmarkClassName = "",
  markClassName = "h-12 w-9",
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
