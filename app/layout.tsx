import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PWABanner from "@/components/PWABanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SpesaSmart — Confronta prezzi, risparmia davvero",
  description:
    "Aggiungi i prodotti che vuoi comprare e trova la combinazione di negozi più conveniente, spedizione inclusa.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SpesaSmart",
  },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
      </head>
      <body className={`${inter.className} bg-slate-50`}>
        <Header />
        <div className="min-h-[calc(100vh-64px-61px)]">{children}</div>
        <Footer />
        <PWABanner />
      </body>
    </html>
  );
}
