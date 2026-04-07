import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 18% 18%, rgba(255,255,255,0.82), transparent 24%), linear-gradient(160deg, rgba(246,239,226,1) 0%, rgba(251,244,232,1) 100%)",
          borderRadius: 42,
        }}
      >
        <div
          style={{
            position: "relative",
            width: 96,
            height: 96,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(160deg, rgba(215,186,132,1) 0%, rgba(182,138,61,1) 56%, rgba(138,98,38,1) 100%)",
              clipPath:
                "path('M16 90V39C16 22.5 29.5 9 46 9C62.5 9 76 22.5 76 39C76 49.4 70.6 58.7 62.4 63.9L46.7 73.8L37.5 59.5L52 50.5C56.7 47.5 59.7 42.3 59.7 36.7C59.7 27.3 52.1 19.7 42.7 19.7C33.3 19.7 25.7 27.3 25.7 36.7V70L35.5 60.5L47 72.2L26.5 90H16Z')",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 42,
              top: 22,
              width: 35,
              height: 35,
              borderRadius: "999px",
              background: "#F3E7CA",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 47.5,
              top: 27.5,
              width: 24,
              height: 24,
              borderRadius: "999px",
              background:
                "radial-gradient(circle at 50% 35%, rgba(182,211,243,1) 0%, rgba(56,89,125,1) 60%, rgba(22,39,59,1) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 56,
              top: 36,
              width: 7.5,
              height: 7.5,
              borderRadius: "999px",
              background: "#1B2230",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 63,
              top: 33,
              width: 3,
              height: 3,
              borderRadius: "999px",
              background: "#FFFFFF",
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
