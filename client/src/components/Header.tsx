// client/src/components/Header.tsx

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu as MenuIcon,
  X,
  LogIn,
  Package,
  LogOut,
  Bell,
  ArrowRightIcon,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import NavigationMenu from "./Menu";

// Use the updated hooks
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Use the updated hooks
  const cart = useCart();
  const wishlist = useWishlist();

  // Get counts
  const cartCount = cart.getCartCount?.() || cart.totalItems || 0;
  const wishlistCount = wishlist.getWishlistCount?.() || 0;

  // Punjabi product announcements
  const announcements = [
    "Handcrafted Zardusi Panjabi | Free Shipping Over ৳5000",
    // "Patiala Salwar Special Collection 🔥",
    // "Premium Punjabi Juttis – New Stock Available ✨",
    // "Fashionable Turbans – Now Available Online 💫",
    // "5000+ Orders Completed – Free Shipping 🎁",
  ];

  // Rotate announcements
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAnnouncement((prev) => (prev + 1) % announcements.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownOpen && !(e.target as Element).closest(".user-dropdown")) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setDropdownOpen(false);
    router.push("/");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  // User menu items
  const userMenuItems = [
    { label: "My Profile", icon: <User size={16} />, href: "/account" },
    { label: "My Orders", icon: <Package size={16} />, href: "/orders" },
    {
      label: "Notifications",
      icon: <Bell size={16} />,
      href: "/notifications",
    },
    { label: "Wishlist", icon: <Heart size={16} />, href: "/wishlist" },
    { label: "Track Order", icon: <Package size={16} />, href: "/track-order" },
    {
      label: "Logout",
      icon: <LogOut size={16} />,
      href: "/logout",
      isLogout: true,
    },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-lg" : "bg-white border-b"
      }`}
    >
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-slate-950 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-10 flex items-center justify-center overflow-hidden">
            <div
              key={currentAnnouncement}
              className="flex items-center space-x-2 animate-slideUp"
            >
              <span className="text-lg">👑</span>
              <span className="font-medium text-sm md:text-base">
                {announcements[currentAnnouncement]}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-18">
        {/* Header Top Row */}
        <div className="h-16 flex items-center justify-between relative">
          {/* Left: Logo & Mobile Menu */}
          <div className="flex items-center w-1/4 justify-start">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg mr-2"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="relative">
                <Image
                  src="/brand-logo.png"
                  alt="PunjabiStyle Logo"
                  width={150}
                  height={150}
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Center: Search Bar (Desktop) */}
          <div className="absolute left-1/2 transform -translate-x-1/2 hidden lg:block">
            <div className="w-[650px]">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Punjabi..."
                  className="w-full px-4 py-2.5 pl-12 pr-24 rounded-full text-slate-800 border border-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-slate-50"
                />
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500"
                  size={20}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-slate-950 to-slate-800 text-white hover:text-amber-500 px-4 py-1.5 rounded-full hover:bg-slate-700 transition-colors text-sm cursor-pointer"
                >
                  Search
                </button>
              </form>
            </div>
          </div>

          {/* Right: Action Icons */}
          <div className="flex items-center space-x-4 w-1/4 justify-end">
            {/* Wishlist with real count */}
            <Link
              href="/wishlist"
              className="relative p-2 bg-slate-100 hover:bg-rose-50 rounded-full transition-colors group user-dropdown"
              aria-label="Wishlist"
              title={`${wishlistCount} items in wishlist`}
            >
              <Heart
                size={22}
                className={`transition-colors ${
                  wishlistCount > 0
                    ? "text-rose-500 fill-rose-500"
                    : "text-gray-700 group-hover:text-rose-500"
                }`}
              />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart with real count */}
            <Link
              href="/cart"
              className="relative p-2 rounded-full transition-colors group hover:bg-slate-100 user-dropdown"
              aria-label="Cart"
              title={`${cartCount} items in cart`}
            >
              <ShoppingBag
                size={22}
                className={`transition-colors ${
                  cartCount > 0
                    ? "text-amber-600"
                    : "text-gray-700 group-hover:text-amber-600"
                }`}
              />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* Track Order Button */}
            {/* <Link
              href="/track-order"
              className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-300 shadow-sm transition-all duration-300 group hover:border-amber-600 hover:shadow-md hover:bg-amber-50"
            >
              <ArrowRightIcon className="w-4 h-4 text-slate-600 group-hover:text-amber-600 transition-colors" />
              <span className="text-sm font-semibold text-slate-800 group-hover:text-amber-700">
                Track Order
              </span>
            </Link> */}
          </div>
        </div>

        {/* Search Bar (Mobile) */}
        <div className="lg:hidden mb-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Punjabi suits, juttis, pagdis..."
              className="w-full px-4 py-3 pl-12 pr-32 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50"
            />
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-slate-950 to-slate-800 text-white hover:text-amber-500 px-4 py-1.5 rounded-lg hover:bg-slate-700 transition-colors text-sm"
            >
              Search
            </button>
          </form>
        </div>

        {/* Navigation Menu Component */}
        <NavigationMenu
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
      </div>
    </header>
  );
}
