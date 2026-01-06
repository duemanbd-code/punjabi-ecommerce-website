// 

"use client";

import { Facebook } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle subscription logic here
    console.log("Subscribed with:", email);
    setEmail("");
    alert("Thank you for subscribing!");
  };

  return (
    <footer className="bg-gradient-to-b from-slate-100 to-white text-slate-900">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center mb-4">
              <div className="relative">
                <Image
                  src="/brand-logo.png"
                  alt="PunjabiStyle Logo"
                  width={120}
                  height={40}
                  className="object-contain h-10 w-auto"
                />
              </div>
            </Link>
            <p className="text-slate-900 text-sm sm:text-base mb-4 leading-relaxed">
              Discover the latest fashion trends with Duaman. We offer premium
              quality clothing for everyone at affordable prices. Your style,
              our passion.
            </p>

            {/* Social media links */}
            <div className="flex space-x-3 sm:space-x-4">
  {/* Facebook Icon */}
  <a
    href="https://www.facebook.com/duemanBDofficial"
    className="text-slate-900 hover:text-amber-600 transition-colors"
    aria-label="Facebook"
    target="_blank"
    rel="noopener noreferrer"
  >
    <svg
      className="w-5 h-5 sm:w-6 sm:h-6"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  </a>

  {/* Pinterest Icon */}
  <a
    href="https://www.pinterest.com/dueman12"
    className="text-slate-900 hover:text-amber-600 transition-colors"
    aria-label="Pinterest"
    target="_blank"
    rel="noopener noreferrer"
  >
    <svg
      className="w-5 h-5 sm:w-6 sm:h-6"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.347-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z" />
    </svg>
  </a>

  {/* Instagram Icon */}
  <a
    href="https://www.instagram.com/duemanofficial"
    className="text-slate-900 hover:text-amber-600 transition-colors"
    aria-label="Instagram"
    target="_blank"
    rel="noopener noreferrer"
  >
    <svg
      className="w-5 h-5 sm:w-6 sm:h-6"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  </a>
</div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Shop</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link
                  href="/category"
                  className="text-slate-900 hover:text-amber-500 transition-colors text-sm sm:text-base"
                >
                  All Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/category/all-collections"
                  className="text-slate-900 hover:text-amber-500 transition-colors text-sm sm:text-base"
                >
                  All Collections
                </Link>
              </li>
             
              <li>
                <Link
                  href="/best-selling"
                  className="text-slate-900 hover:text-amber-600 transition-colors text-sm sm:text-base"
                >
                  Popular Punjabi
                </Link>
              </li>
              <li>
                <Link
                  href="/new-arrivals"
                  className="text-slate-900 hover:text-amber-600 transition-colors text-sm sm:text-base"
                >
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Customer Service</h3>
            <ul className="space-y-1.5 sm:space-y-2">
             
              <li>
                <Link
                  href="/shipping"
                  className="text-slate-900 hover:text-amber-600 transition-colors text-sm sm:text-base"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-slate-900 hover:text-amber-600 transition-colors text-sm sm:text-base"
                >
                  Returns & Exchanges
                </Link>
              </li>
            
              <li>
                <Link
                  href="/faq"
                  className="text-slate-900 hover:text-amber-600 transition-colors text-sm sm:text-base"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/track-order"
                  className="text-slate-900 hover:text-amber-600 transition-colors text-sm sm:text-base"
                >
                  Track Order
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods & Trust Badges */}
        <div className="border-t border-gray-300 mt-6 sm:mt-8 pt-6 sm:pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            {/* Payment Methods */}
            <div className="w-full lg:w-auto">
              <h4 className="text-sm font-semibold mb-3 text-center lg:text-left">
                We Accept
              </h4>
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3">
                <div className="bg-white p-1.5 sm:p-2 rounded-lg shadow-sm">
                  <span className="text-xs font-bold bg-gradient-to-r from-red-600 to-slate-950 text-white px-2 py-1 sm:px-3 sm:py-1.5">
                    BKASH
                  </span>
                </div>
                <div className="bg-white p-1.5 sm:p-2 rounded-lg shadow-sm">
                  <span className="text-xs font-bold bg-gradient-to-r from-pink-600 to-slate-950 text-white px-2 py-1 sm:px-3 sm:py-1.5">
                    NOGOD
                  </span>
                </div>
                <div className="bg-white p-1.5 sm:p-2 rounded-lg shadow-sm">
                  <span className="text-xs font-bold bg-gradient-to-r from-yellow-600 to-slate-950 text-white px-2 py-1 sm:px-3 sm:py-1.5">
                    UPAY
                  </span>
                </div>
                <div className="bg-white p-1.5 sm:p-2 rounded-lg shadow-sm">
                  <span className="text-xs font-bold bg-gradient-to-r from-slate-950 via-black to-amber-600 text-white px-2 py-1 sm:px-3 sm:py-1.5">
                    ROCKET
                  </span>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <div className="text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-1">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-xs text-slate-900">Secure Payment</span>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-1">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <span className="text-xs text-slate-900">Free Shipping</span>
              </div>
             
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-300 text-slate-500">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Left - Copyright */}
            <div className="text-xs sm:text-sm text-center md:text-left order-2 md:order-1">
              © {new Date().getFullYear()} Duaman. All rights reserved.
            </div>

            {/* Center - Developer Credit */}
            <div className="text-xs sm:text-sm font-medium text-slate-600 text-center order-1 md:order-2">
              Designed & developed by{" "}
              <a
                href="https://www.facebook.com/mironsolutions"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-slate-800 hover:text-slate-950 transition-colors"
                
              >
                Miron Solution
              </a>
            </div>

            {/* Right - Policy Links */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 order-3">
              <Link
                href="/privacy"
                className="hover:text-slate-700 text-xs sm:text-sm transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-slate-700 text-xs sm:text-sm transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="hover:text-slate-700 text-xs sm:text-sm transition-colors"
              >
                Cookie Policy
              </Link>

              <p> this is the extra added</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}