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
            "linear-gradient(160deg, rgba(214,181,147,1) 0%, rgba(120,158,191,1) 45%, rgba(32,46,58,1) 100%)",
          borderRadius: 112,
          color: "#fff8ef",
          fontSize: 224,
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
