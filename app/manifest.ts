import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "worship-chord",
    short_name: "worship-chord",
    description:
      "Dark-mode chord & lyric viewer for public-domain hymns. Built for low-light environments.",
    start_url: "/worship-chord/",
    scope: "/worship-chord/",
    display: "standalone",
    orientation: "any",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/worship-chord/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
