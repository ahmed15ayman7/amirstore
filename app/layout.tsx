import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./store-v2.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
const TITLE = "Amir Store | شحن كوينز eFootball وكل الألعاب";
const DESC = "شحن كوينز eFootball شرعي ومضمون ومن غير تسجيل دخول، وشحن لكل الألعاب. Amir Store من 2021.";
const LOGO = { url: "/logo.png", width: 640, height: 640, alt: "Amir Store — eFootball" };

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESC,
  applicationName: "Amir Store",
  alternates: { canonical: "/" },
  icons: { icon: [{ url: "/logo.png", type: "image/png" }], apple: "/logo.png", shortcut: "/logo.png" },
  openGraph: { type: "website", siteName: "Amir Store", locale: "ar_EG", url: "/", title: TITLE, description: DESC, images: [LOGO] },
  twitter: { card: "summary", title: TITLE, description: DESC, images: ["/logo.png"] },
};

/* tells Google which image is the brand logo in search results */
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Amir Store",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#09090b" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Lalezar&display=swap" rel="stylesheet" />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        {children}
      </body>
    </html>
  );
}
