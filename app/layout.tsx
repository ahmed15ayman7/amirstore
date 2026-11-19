import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./store-v2.css";

export const metadata: Metadata = {
  title: "Amir Store | شحن كوينز eFootball وكل الألعاب",
  description: "شحن كوينز eFootball شرعي ومضمون ومن غير تسجيل دخول، وشحن لكل الألعاب. Amir Store من 2021.",
  icons: { icon: "/coins.png" },
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
      <body>{children}</body>
    </html>
  );
}
