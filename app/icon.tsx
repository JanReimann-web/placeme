import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

function IconMarkup() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(145deg, #f7f2ff 0%, #ebe0ff 52%, #d9c6ff 100%)",
        borderRadius: 120,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 18% 14%, rgba(255,255,255,0.65), transparent 22%), radial-gradient(circle at 82% 82%, rgba(255,255,255,0.32), transparent 20%)",
        }}
      />
      <svg
        viewBox="0 0 512 512"
        width="78%"
        height="78%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="icon-stem" x1="142" y1="108" x2="226" y2="356">
            <stop offset="0" stopColor="#8B67F0" />
            <stop offset="1" stopColor="#4C3690" />
          </linearGradient>
          <linearGradient id="icon-ring" x1="250" y1="104" x2="381" y2="286">
            <stop offset="0" stopColor="#E4D8FF" />
            <stop offset="0.38" stopColor="#B99BFA" />
            <stop offset="1" stopColor="#724FD6" />
          </linearGradient>
          <radialGradient id="icon-lens" cx="0.4" cy="0.35" r="0.9">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.38" stopColor="#D4ECFF" />
            <stop offset="0.7" stopColor="#6C93C6" />
            <stop offset="1" stopColor="#1B243E" />
          </radialGradient>
        </defs>

        <path
          d="M142 108C142 92.536 154.536 80 170 80H183C214.904 80 244.878 95.208 263.706 120.962L267.758 126.497C285.445 150.687 290.645 181.778 281.78 210.341C275.875 229.369 263.758 245.886 247.358 257.26L190.3 296.83V261.134L220.428 240.246C231.018 232.91 238.85 222.223 242.652 209.889C248.358 191.382 244.966 171.242 233.395 155.286L229.342 149.751C215.347 130.6 193.068 119.258 169.357 119.258H156.47V356H120V108H142Z"
          fill="url(#icon-stem)"
        />
        <circle cx="283" cy="191" r="74" fill="url(#icon-ring)" />
        <circle cx="283" cy="191" r="40" fill="url(#icon-lens)" />
        <circle cx="272" cy="180" r="9" fill="rgba(255,255,255,0.9)" />
        <circle cx="319" cy="135" r="12" fill="#F7F2FF" />
        <circle cx="329" cy="210" r="8" fill="#FBF8FF" />
      </svg>
    </div>
  );
}

export default function Icon() {
  return new ImageResponse(<IconMarkup />, size);
}
