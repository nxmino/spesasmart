import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import PWABanner from "@/components/PWABanner";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

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
  themeColor: "#0B3D2C",
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
      <body className={figtree.className}>
        <Header />
        <main className="pb-nav lg:pb-6">{children}</main>
        <BottomNav />
        <PWABanner />
      </body>
    </html>
  );
}
