import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import { I18nProvider } from "@/lib/i18n";
import Footer from "@/components/shared/Footer";
import OneSignalInit from "@/components/shared/OneSignalInit";

export const metadata: Metadata = {
  title: { default: "Lost & Found Cameroon", template: "%s | Back2U" },
  description: "#1 Lost & Found Recovery Network. Report lost items, find what you've lost, and connect with honest people across Cameroon.",
  keywords: ["lost and found", "Cameroon", "Douala", "Yaoundé", "Back2U", "objets perdus", "trouvés"],
  authors: [{ name: "Back2U" }],
  creator: "Back2U",
  publisher: "Back2U",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Back2U" },
  openGraph: {
    type: "website", locale: "en_CM", url: "https://back2u-cmr.vercel.app", siteName: "Back2U",
    title: "Back2U - Lost & Found Cameroon",
    description: "Cameroon's #1 Lost & Found Recovery Network",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Back2U - Lost & Found Cameroon" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lost & Found Cameroon",
    description: "Cameroon's #1 Lost & Found Recovery Network",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#009A49",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <style>{`
          :root {
            --color-primary: #009A49;
            --color-secondary: #FCD116;
            --color-accent: #CE1126;
            --color-feature: #00ADB5;
            --color-dark: #222831;
            --color-dark-alt: #393E46;
            --color-bg: #F0F4F8;
            --color-surface: #F0FDF4;
          }
          * { box-sizing: border-box; }
          html { scroll-behavior: smooth; }
        `}</style>
      </head>
      <body className="antialiased" style={{ background: "#F0F4F8" }}>
        <I18nProvider>
          <OneSignalInit />
          <Navbar />
          <main className="pt-14 md:pt-16">
            {children}
          </main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}