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
      <head>
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="d5aaa4a2-b462-4873-8530-cb3d62544d82"
        ></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
