import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LinkConn Rent",
    short_name: "LinkConn Rent",
    description:
      "Find verified rental properties and connect directly with landlords across Nigeria.",
    start_url: "/",
    display: "standalone",
    background_color: "#FDF9F0",
    theme_color: "#006041",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
