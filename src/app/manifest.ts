import type { MetadataRoute } from "next";
import { seo, settings } from "@/lib/content";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: settings.siteName,
    short_name: "Guildbourne",
    description: seo.global.defaultDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffdb00",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
