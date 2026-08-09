import type { Metadata } from "next";
import { Inter, Geist, JetBrains_Mono } from "next/font/google";
import "sileo/styles.css";
import "./globals.css";
import { NotificationToaster } from "@/components/ui/NotificationToaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EstiloTurno",
  description: "Plataforma para gestionar y automatizar citas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${geist.variable} ${jetbrainsMono.variable}`}>
        <NotificationToaster />
        {children}
      </body>
    </html>
  );
}
