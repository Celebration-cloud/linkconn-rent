import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import AppProviders from "@/providers/app-providers";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LinkConn Rent | direct verified properties in Nigeria",
  description: "Rent properties in Nigeria direct from landlords. Discover verified listings, chat securely, and manage rent — all in one place.",
  keywords: ["renting", "landlords", "apartments in Nigeria", "no agents", "verified listings"],
  authors: [{ name: "LinkConn Rent" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "LinkConn Rent | direct verified properties in Nigeria",
    description: "Rent properties in Nigeria direct from landlords. Scam-free and verified.",
    type: "website",
    locale: "en_NG",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={manrope.variable}
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-screen flex-col bg-sand-50 font-sans text-ink antialiased">
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[70] -translate-y-24 rounded-lg bg-forest-900 px-4 py-2 text-sm font-bold text-white transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <Suspense fallback={children}>
          <AppProviders>{children}</AppProviders>
        </Suspense>
      </body>
    </html>
  );
}
