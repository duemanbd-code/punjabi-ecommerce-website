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
  UserPlus,
  ShoppingBag as OrdersIcon,
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
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");

  // Use the updated hooks
  const cart = useCart();
  const wishlist = useWishlist();

  // Get counts
  const cartCount = cart.getCartCount?.() || cart.totalItems || 0;
  const wishlistCount = wishlist.getWishlistCount?.() || 0;

  // Announcements
  const announcements = [
    "Handcrafted Zardusi Panjabi | Free Shipping Over ৳5000",
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

  // Check login status and get user info
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          setIsLoggedIn(true);
          setUserName(user.name || user.email?.split('@')[0] || "User");
          setUserEmail(user.email || "");
        } catch (error) {
          console.error("Error parsing user data:", error);
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
        setUserName("");
        setUserEmail("");
      }
    };

    checkLoginStatus();
    window.addEventListener("storage", checkLoginStatus);
    return () => window.removeEventListener("storage", checkLoginStatus);
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
    setUserName("");
    setUserEmail("");
    setDropdownOpen(false);
    router.push("/");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const handleRegister = () => {
    router.push("/register");
  };

  // Get user initial for avatar
  const getUserInitial = () => {
    if (userName) {
      return userName.charAt(0).toUpperCase();
    }
    if (userEmail) {
      return userEmail.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-lg" : "bg-white border-b border-slate-200"
      }`}
    >
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Top Row */}
        <div className="h-16 flex items-center justify-between">
          {/* Left: Logo & Mobile Menu */}
          <div className="flex items-center gap-2 lg:w-1/4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={24} className="text-slate-600" /> : <MenuIcon size={24} className="text-slate-600" />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="relative">
                <Image
                  src="/brand-logo.png"
                  alt="PunjabiStyle Logo"
                  width={140}
                  height={140}
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden lg:flex lg:items-center lg:justify-center lg:flex-1">
            <div className="w-full max-w-xl">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Punjabi suits, juttis, pagdis..."
                  className="w-full px-5 py-2.5 pl-12 pr-20 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-slate-800"
                />
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-slate-800 text-white hover:bg-slate-950 px-4 py-1.5 rounded-full transition-all duration-300 text-sm font-medium cursor-pointer"
                >
                  Search
                </button>
              </form>
            </div>
          </div>

          {/* Right: Action Icons */}
          <div className="flex items-center gap-3 lg:w-1/4 justify-end">
            {/* Wishlist Icon */}
            <Link
              href="/wishlist"
              className="relative p-2 hover:bg-slate-100 rounded-full transition-all duration-300"
              aria-label="Wishlist"
            >
              <Heart
                size={22}
                className={`transition-colors ${
                  wishlistCount > 0
                    ? "text-rose-500 fill-rose-500"
                    : "text-slate-600 hover:text-rose-500"
                }`}
              />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2 hover:bg-slate-100 rounded-full transition-all duration-300"
              aria-label="Cart"
            >
              <ShoppingBag
                size={22}
                className={`transition-colors ${
                  cartCount > 0
                    ? "text-amber-600"
                    : "text-slate-600 hover:text-amber-600"
                }`}
              />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* Account Button - Moved to the END */}
            {!isLoggedIn ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-amber-50 text-slate-800 hover:text-amber-600 rounded-full transition-all duration-300 shadow-sm font-medium">
                  <ArrowRightIcon size={18} className="rotate-180" />
                  <span>Account</span>
                </button>
                
                {/* Dropdown with Sign In and Register options */}
                <div className="absolute right-0 mt-3 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                    <button
                      onClick={handleLogin}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-600 transition-all duration-200 border-b border-slate-100"
                    >
                      <LogIn size={16} />
                      <span>Sign In</span>
                    </button>
                    <button
                      onClick={handleRegister}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-600 transition-all duration-200"
                    >
                      <UserPlus size={16} />
                      <span>Register</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Logged In - User Avatar with Dropdown */
              <div className="relative user-dropdown">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-all duration-300"
                  aria-label="User menu"
                >
                  {/* Avatar with User Initial */}
                  <div className="w-9 h-9 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {getUserInitial()}
                  </div>
                  <ChevronDown 
                    size={18} 
                    className={`text-slate-600 transition-transform duration-300 ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu for Logged In Users */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-slideDown">
                    {/* User Info Header */}
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {getUserInitial()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{userName}</p>
                          <p className="text-xs text-slate-500">{userEmail}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-2">
                      {/* <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-600 transition-all duration-200"
                      >
                        <User size={16} />
                        <span>My Profile</span>
                      </Link> */}
                      {/* <Link
                        href="/orders"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-600 transition-all duration-200"
                      >
                        <OrdersIcon size={16} />
                        <span>My Orders</span>
                      </Link> */}
                      <Link
                        href="/wishlist"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-600 transition-all duration-200"
                      >
                        <Heart size={16} />
                        <span>Wishlist</span>
                        {wishlistCount > 0 && (
                          <span className="ml-auto bg-amber-100 text-amber-600 text-xs px-2 py-0.5 rounded-full">
                            {wishlistCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        href="/cart"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-600 transition-all duration-200"
                      >
                        <ShoppingBag size={16} />
                        <span>Shopping Cart</span>
                        {cartCount > 0 && (
                          <span className="ml-auto bg-amber-100 text-amber-600 text-xs px-2 py-0.5 rounded-full">
                            {cartCount}
                          </span>
                        )}
                      </Link>
                      
                      {/* Divider */}
                      <div className="border-t border-slate-100 my-2"></div>
                      
                      {/* Logout Button */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all duration-200"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Search Bar (Mobile) */}
        <div className="lg:hidden mt-2 mb-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Punjabi suits, juttis, pagdis..."
              className="w-full px-4 py-3 pl-12 pr-32 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
            />
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
              size={20}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-slate-800 text-white hover:bg-slate-950 px-4 py-1.5 rounded-lg transition-all duration-300 text-sm font-medium"
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

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
      `}</style>
    </header>
  );
}