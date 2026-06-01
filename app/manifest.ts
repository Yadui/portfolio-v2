import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Abhinav Yadav Portfolio",
    short_name: "Abhinav Yadav",
    description:
      "Portfolio of Abhinav Yadav — Cloud & AI Engineer, Full-Stack Developer and Creative Developer.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffdf8",
    theme_color: "#00ff99",
    icons: [
      {
        src: "/pacman.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
