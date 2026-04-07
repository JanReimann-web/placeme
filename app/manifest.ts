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
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
