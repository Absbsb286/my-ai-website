import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Blobby Jelly — Multiplayer Jelly Jump Game",
  description: "Race to the top in this multiplayer jelly platformer. Jump, collect jellies, activate power-ups, and compete with friends in real-time P2P races.",
  keywords: ["multiplayer game", "WebRTC", "platformer", "jelly", "P2P", "real-time"],
  authors: [{ name: "Blobby Jelly Team" }],
  openGraph: {
    title: "Blobby Jelly — Multiplayer Jelly Jump Game",
    description: "Race to the top in this multiplayer jelly platformer.",
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blobby Jelly",
    description: "Multiplayer jelly jump race game",
  },
  robots: "index, follow",
};

export const viewport: Viewport = {
  themeColor: "#070918",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
