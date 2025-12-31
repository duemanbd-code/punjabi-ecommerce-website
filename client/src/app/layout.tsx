// client/src/app/layout.tsx

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Topbar from "@/components/Topbar";
import Providers from "@/components/Providers";

// Load local Geist font
const geistSans = localFont({
  src: "/fonts/Geist.ttf",
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: "/fonts/GeistMono.ttf",
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ecommerce-Sample",
  description: "Shop for fashion essentials.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <Providers>
          <Header />
          <Topbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
