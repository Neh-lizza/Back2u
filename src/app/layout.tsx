// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

// ── Font — next/font for performance (NFR1.1) ──
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

// ── Metadata ──
export const metadata: Metadata = {
  title: {
    default: "Back2U — Lost & Found Cameroon",
    template: "%s | Back2U",
  },
  description:
    "Cameroon's #1 Lost & Found Recovery Network. Report lost items, find what you've lost, and connect with honest people across Cameroon.",
  keywords: [
    "lost and found",
    "Cameroon",
    "Douala",
    "Yaoundé",
    "Back2U",
    "objets perdus",
    "trouvés",
  ],
  authors: [{ name: "Back2U" }],
  creator: "Back2U",
  publisher: "Back2U",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Back2U",
  },
  openGraph: {
    type: "website",
    locale: "en_CM",
    url: "https://back2u.cm",
    siteName: "Back2U",
    title: "Back2U — Lost & Found Cameroon",
    description: "Cameroon's #1 Lost & Found Recovery Network",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Back2U — Lost & Found Cameroon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Back2U — Lost & Found Cameroon",
    description: "Cameroon's #1 Lost & Found Recovery Network",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#009A49",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="bg-[#0a0a0a] antialiased">
        <Navbar />
        <main className="pt-20 md:pt-28">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}