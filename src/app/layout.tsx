import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Générateur d'articles cinéma",
  description: "Recherchez des films et personnalités",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <main className="min-h-screen bg-gray-50 p-4 text-black">
          <div className="max-w-4xl mx-auto">{children}</div>
        </main>
      </body>
    </html>
  );
}
