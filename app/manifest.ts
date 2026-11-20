import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Amir Store | شحن كوينز eFootball",
    short_name: "Amir Store",
    description: "شحن كوينز eFootball بأرخص سعر في مصر",
    start_url: "/",
    display: "standalone",
    dir: "rtl",
    lang: "ar-EG",
    background_color: "#09090b",
    theme_color: "#09090b",
    icons: [{ src: "/logo.png", sizes: "640x640", type: "image/png", purpose: "any" }],
  };
}
