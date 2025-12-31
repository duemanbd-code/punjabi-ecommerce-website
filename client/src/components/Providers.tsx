// client/src/components/Providers.tsx

"use client";

import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import Topbar from "@/components/Topbar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <WishlistProvider>
        <Toaster position="top-right" />
        <Topbar />
        <Header />
        <main>{children}</main>
        <Footer />
      </WishlistProvider>
    </CartProvider>
  );
}