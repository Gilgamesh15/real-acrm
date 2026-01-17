import { data } from "react-router";

export async function loader() {
  return data(
    {
      name: "ACRM | Fashion Projects",
      short_name: "ACRM",
      icons: [
        {
          src: "/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
      theme_color: "#ffffff",
      background_color: "#ffffff",
      display: "standalone",
    },
    { status: 200 }
  );
}
