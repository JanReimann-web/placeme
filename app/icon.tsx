import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 512,
  height: 512,
};
export const contentType = "image/png";

export default function Icon() {
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
            "radial-gradient(circle at 18% 18%, rgba(255,255,255,0.8), transparent 24%), linear-gradient(160deg, rgba(246,239,226,1) 0%, rgba(251,244,232,1) 100%)",
          borderRadius: 112,
        }}
      >
        <div
          style={{
            position: "relative",
            width: 276,
            height: 276,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(160deg, rgba(215,186,132,1) 0%, rgba(182,138,61,1) 56%, rgba(138,98,38,1) 100%)",
              clipPath:
                "path('M48 258V112C48 64.5 86.5 26 134 26C181.5 26 220 64.5 220 112C220 142.7 203.8 169.9 179.7 185.2L134.5 214L107.8 172.1L150 145.8C164.2 136.7 173.2 120.8 173.2 103.9C173.2 77.1 151.5 55.4 124.7 55.4C97.9 55.4 76.2 77.1 76.2 103.9V195L104.8 167L138 201L78.7 258H48Z')",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 124,
              top: 60,
              width: 102,
              height: 102,
              borderRadius: "999px",
              background: "#F3E7CA",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 139,
              top: 75,
              width: 72,
              height: 72,
              borderRadius: "999px",
              background:
                "radial-gradient(circle at 50% 35%, rgba(182,211,243,1) 0%, rgba(56,89,125,1) 60%, rgba(22,39,59,1) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 164,
              top: 100,
              width: 22,
              height: 22,
              borderRadius: "999px",
              background: "#1B2230",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 184,
              top: 93,
              width: 8,
              height: 8,
              borderRadius: "999px",
              background: "#FFFFFF",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 116,
              top: 50,
              width: 12,
              height: 12,
              borderRadius: "999px",
              background: "#F4D291",
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
