// client/src/context/WishlistContext.tsx

"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface WishlistItem {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  category?: string;
  normalPrice?: number;
  originalPrice?: number;
  offerPrice?: number;
  rating?: number;
  sizes?: any[];
  stock?: number;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  wishlistIds: string[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  getWishlistCount: () => number;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("wishlist");
      if (stored) {
        try {
          setWishlist(JSON.parse(stored));
        } catch (error) {
          console.error("Error parsing wishlist:", error);
          setWishlist([]);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist]);

  const addToWishlist = (item: WishlistItem) => {
    console.log("Adding to wishlist:", item);
    setWishlist((prev) => {
      // Check if already exists
      const exists = prev.some(p => p.id === item.id);
      if (exists) {
        console.log("Product already in wishlist");
        return prev;
      }
      console.log("Product added to wishlist");
      return [...prev, item];
    });
  };

  const removeFromWishlist = (id: string) => {
    console.log("Removing from wishlist:", id);
    setWishlist((prev) => prev.filter((item) => item.id !== id));
  };

  const isInWishlist = (id: string) => {
    const exists = wishlist.some(item => item.id === id);
    console.log(`Checking if ${id} is in wishlist: ${exists}`);
    return exists;
  };
  
  const getWishlistCount = () => wishlist.length;
  
  const clearWishlist = () => setWishlist([]);
  
  const wishlistIds = wishlist.map(item => item.id);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistIds,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        getWishlistCount,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
};