import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

function AppleIconMarkup() {
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
        borderRadius: 44,
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
        viewBox="0 0 180 180"
        width="78%"
        height="78%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="apple-stem" x1="42" y1="40" x2="74" y2="154">
            <stop offset="0" stopColor="#8B67F0" />
            <stop offset="1" stopColor="#4C3690" />
          </linearGradient>
          <linearGradient id="apple-ring" x1="90" y1="34" x2="136" y2="100">
            <stop offset="0" stopColor="#E4D8FF" />
            <stop offset="0.38" stopColor="#B99BFA" />
            <stop offset="1" stopColor="#724FD6" />
          </linearGradient>
          <radialGradient id="apple-lens" cx="0.4" cy="0.35" r="0.9">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.38" stopColor="#D4ECFF" />
            <stop offset="0.7" stopColor="#6C93C6" />
            <stop offset="1" stopColor="#1B243E" />
          </radialGradient>
        </defs>

        <path
          d="M50 38C50 32.477 54.477 28 60 28H64.6C76.195 28 87.097 33.527 93.943 42.889L95.413 44.897C101.835 53.682 103.723 64.966 100.502 75.339C98.355 82.251 93.95 88.252 87.986 92.388L67.2 106.806V93.806L78.177 86.194C82.04 83.518 84.897 79.62 86.285 75.123C88.367 68.369 87.13 61.018 82.907 55.194L81.437 53.186C76.328 46.194 68.195 42.056 59.538 42.056H54.832V128H41.52V38H50Z"
          fill="url(#apple-stem)"
        />
        <circle cx="100" cy="66" r="28" fill="url(#apple-ring)" />
        <circle cx="100" cy="66" r="15" fill="url(#apple-lens)" />
        <circle cx="96" cy="62" r="3.3" fill="rgba(255,255,255,0.9)" />
        <circle cx="114" cy="45" r="4.5" fill="#F7F2FF" />
        <circle cx="118" cy="73" r="3" fill="#FBF8FF" />
      </svg>
    </div>
  );
}

export default function AppleIcon() {
  return new ImageResponse(<AppleIconMarkup />, size);
}
