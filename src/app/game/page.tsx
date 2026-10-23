import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blobby Jelly — Game",
  description: "Race to the top in this multiplayer jelly platformer. Jump, collect jellies, activate power-ups, and compete with friends in real-time P2P races.",
  openGraph: {
    title: "Blobby Jelly — Multiplayer Jelly Jump Game",
    description: "Race to the top in this multiplayer jelly platformer.",
    type: "website",
    url: "/game",
    images: [{ url: "/images/og-blobby.png", width: 1200, height: 630, alt: "Blobby Jelly" }],
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blobby Jelly",
    description: "Multiplayer jelly jump race game",
    images: ["/images/og-blobby.png"],
  },
};

export default function GamePage() {
  return (
    <iframe
      src="/bloby.html"
      title="Blobby Jelly Game"
      style={{ border: "none", width: "100vw", height: "100dvh", display: "block" }}
    />
  );
}
