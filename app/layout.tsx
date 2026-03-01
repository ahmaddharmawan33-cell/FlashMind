import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlashMind — Platform Belajar Berbasis AI",
  description:
    "Belajar lebih cerdas dengan flashcard AI, latihan soal adaptif, dan tutor AI personal.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body>{children}</body>
    </html>
  );
}
