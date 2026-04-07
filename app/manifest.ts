import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PlaceMe",
    short_name: "PlaceMe",
    description: "Create AI travel photos of yourself anywhere in the world.",
    start_url: "/app",
    display: "standalone",
    background_color: "#f4efff",
    theme_color: "#f4efff",
    orientation: "portrait",
    icons: [
      {
        src: "/icon?size=192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon?size=512",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
