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
            "linear-gradient(155deg, rgba(228,204,177,1) 0%, rgba(142,176,205,1) 48%, rgba(44,58,71,1) 100%)",
          borderRadius: 42,
          color: "#fff8ef",
          fontSize: 88,
          fontWeight: 700,
          letterSpacing: "-0.06em",
        }}
      >
        P
      </div>
    ),
    size,
  );
}
