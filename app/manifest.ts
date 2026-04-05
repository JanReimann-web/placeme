import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PlaceMe",
    short_name: "PlaceMe",
    description: "Create AI travel photos of yourself anywhere in the world.",
    start_url: "/app",
    display: "standalone",
    background_color: "#f6f2ea",
    theme_color: "#f6f2ea",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icons/maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
