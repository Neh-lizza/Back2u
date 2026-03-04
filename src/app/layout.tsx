// src/app/layout.tsx
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Back2U - Reconnect & Recover",
  description: "Community lost & found app for Cameroon",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body 
        className={`${poppins.variable} antialiased bg-[#0a0a0a] text-white selection:bg-primary selection:text-black`}
      >
        {/* The Navbar stays at the top of every page */}
        <Navbar />
        
        {/* Main content wrapper with padding-top to prevent Navbar overlap */}
        <main className="min-h-screen pt-20 md:pt-28">
          {children}
        </main>

        {/* The Footer stays at the bottom of every page */}
        <Footer />
      </body>
    </html>
  );
}