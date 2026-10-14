import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"; // <-- Importación del rastreador

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Life Peptides — Investigación de Péptidos de Precisión",
  description: "Catálogo oficial de Life Peptides. Ciencia, pureza y precisión.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={`${serif.variable} ${sans.variable}`}>
      <body suppressHydrationWarning>
        {children}
        <Analytics /> {/* <-- Rastreador activado de fondo */}
      </body>
    </html>
  );
}