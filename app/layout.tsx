import type { Metadata, Viewport } from "next";
import { SEO_DESC, SEO_KEYWORDS, SEO_TITLE, SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";
import "./store-v2.css";

const LOGO = { url: "/logo.png", width: 640, height: 640, alt: "Amir Store — شحن كوينز eFootball" };

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SEO_TITLE, template: `%s | ${SITE_NAME}` },
  description: SEO_DESC,
  keywords: SEO_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "games",
  alternates: { canonical: "/" },
  formatDetection: { telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  icons: { icon: [{ url: "/logo.png", type: "image/png" }], apple: "/logo.png", shortcut: "/logo.png" },
  manifest: "/manifest.webmanifest",
  openGraph: { type: "website", siteName: SITE_NAME, locale: "ar_EG", url: "/", title: SEO_TITLE, description: SEO_DESC, images: [LOGO] },
  twitter: { card: "summary", title: SEO_TITLE, description: SEO_DESC, images: ["/logo.png"] },
  // set GOOGLE_SITE_VERIFICATION in Vercel with the code from Google Search Console
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || "nr3HGna-rQiRiZkbiCInnMtZqufhhN5d2-oSEs-IxFg" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#09090b" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar-EG" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Lalezar&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
