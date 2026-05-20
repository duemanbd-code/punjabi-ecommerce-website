// from client/src/components/Menu.tsx

"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight, Menu as MenuIcon, X } from "lucide-react";

interface MenuProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

interface CategoryItem {
  name: string;
  href: string;
  isParent?: boolean;
  subItems?: { name: string; href: string }[];
}

const categoryItems: CategoryItem[] = [
  { name: "All Categories", href: "/category/all" },
  { 
    name: "Panjabi", 
    href: "/category/panjabi", 
    isParent: true,
    subItems: [
      { name: "Regular Panjabi", href: "/category/regular-panjabi" },
      { name: "Premium Panjabi", href: "/category/premium-panjabi" },
      { name: "Luxury Panjabi", href: "/category/luxury-panjabi" }
    ]
  },
  { name: "Shirts", href: "/category/shirts" },
];

export default function Menu({ mobileMenuOpen, setMobileMenuOpen }: MenuProps) {
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        categoryMenuOpen &&
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(e.target as Node)
      ) {
        setCategoryMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [categoryMenuOpen]);

  return (
    <>
      {/* Desktop Menu */}
      <div className="hidden lg:flex items-center justify-center py-3 border-t">
        <nav className="flex items-center space-x-8">
          {/* Shop by Category Dropdown */}
          <div className="relative category-menu" ref={categoryMenuRef}>
            <button
              onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
              className="flex items-center space-x-1 px-4 py-2 text-slate-700 hover:text-amber-600 font-medium transition-colors cursor-pointer"
            >
              <span>Shop by Category</span>
              <ChevronDown
                size={18}
                className={`transition-transform ${
                  categoryMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {categoryMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-slate-200 shadow-lg rounded-xl z-50 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3">
                  {/* <h3 className="text-white font-bold">Shop by Category</h3> */}
                  <p className="text-amber-100 text-md">Find your perfect style</p>
                </div>

                <div className="py-2">
                  {/* All Categories Link */}
                  <Link
                    href="/category/all"
                    onClick={() => setCategoryMenuOpen(false)}
                    className="block px-4 py-3 text-gray-800 font-semibold hover:bg-amber-50 hover:text-amber-600 transition-colors border-b border-slate-100"
                  >
                    All Categories
                  </Link>

                  {/* Panjabi with Subcategories */}
                  <div className="border-b border-slate-100">
                    <div className="px-4 py-3">
                      <Link
                        href="/category/panjabi"
                        onClick={() => setCategoryMenuOpen(false)}
                        className="font-semibold text-gray-800 hover:text-amber-600 transition-colors block mb-2"
                      >
                        Panjabi
                      </Link>
                      <div className="ml-4 space-y-1">
                        <Link
                          href="/category/regular-panjabi"
                          onClick={() => setCategoryMenuOpen(false)}
                          className="block text-sm text-gray-600 hover:text-amber-600 py-1.5"
                        >
                          • Regular Panjabi
                        </Link>
                        <Link
                          href="/category/premium-panjabi"
                          onClick={() => setCategoryMenuOpen(false)}
                          className="block text-sm text-gray-600 hover:text-amber-600 py-1.5"
                        >
                          • Premium Panjabi
                        </Link>
                        <Link
                          href="/category/luxury-panjabi"
                          onClick={() => setCategoryMenuOpen(false)}
                          className="block text-sm text-gray-600 hover:text-amber-600 py-1.5"
                        >
                          • Luxury Panjabi
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Shirts */}
                  <Link
                    href="/category/shirts"
                    onClick={() => setCategoryMenuOpen(false)}
                    className="block px-4 py-3 text-gray-800 font-semibold hover:bg-amber-50 hover:text-amber-600 transition-colors"
                  >
                    Shirts
                  </Link>
                </div>

                {/* Bottom Border */}
                <div className="flex justify-center">
                  <div className="w-[70%] h-1 bg-amber-500 rounded-full mb-1"></div>
                </div>
              </div>
            )}
          </div>

          {/* All Collections */}
          <Link
            href="/all-collections"
            className="px-4 py-2 text-slate-700 hover:text-slate-950 bg-amber-50 font-bold transition-colors cursor-pointer rounded-lg"
          >
            All Collections
          </Link>

          {/* Popular Panjabi */}
          <Link
            href="/best-selling"
            className="px-4 py-2 text-amber-400 hover:text-amber-500 bg-slate-950 rounded-full font-medium transition-colors cursor-pointer"
          >
            Popular Panjabi
          </Link>

          {/* New Arrivals */}
          <Link
            href="/new-arrivals"
            className="px-4 py-2 text-rose-600 hover:text-rose-700 font-bold transition-colors cursor-pointer"
          >
            New Arrivals
          </Link>
        </nav>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 mt-28 top-[calc(56px+40px)] bg-white z-40 animate-slideIn overflow-y-auto">
          <div className="p-4">
            <div className="space-y-2 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 px-2 text-lg">Menu</h3>

              {/* All Categories */}
              <Link
                href="/category/all"
                className="block w-full text-left px-4 py-3 text-gray-700 font-medium hover:bg-amber-50 rounded-lg border-b"
                onClick={() => setMobileMenuOpen(false)}
              >
                All Categories
              </Link>

              {/* Panjabi with Subcategories - Mobile */}
              <div>
                <button
                  onClick={() => setMobileCategoryOpen(!mobileCategoryOpen)}
                  className="flex items-center justify-between w-full px-4 py-3 text-gray-700 font-medium border-b"
                >
                  <span>Panjabi</span>
                  <ChevronRight
                    size={20}
                    className={`transition-transform ${
                      mobileCategoryOpen ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {mobileCategoryOpen && (
                  <div className="pl-6 mt-2 space-y-2 bg-amber-50/30 rounded-lg py-2">
                    <Link
                      href="/category/panjabi"
                      className="block w-full text-left px-4 py-2.5 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      All Panjabi
                    </Link>
                    <Link
                      href="/category/regular-panjabi"
                      className="block w-full text-left px-4 py-2.5 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Regular Panjabi
                    </Link>
                    <Link
                      href="/category/premium-panjabi"
                      className="block w-full text-left px-4 py-2.5 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Premium Panjabi
                    </Link>
                    <Link
                      href="/category/luxury-panjabi"
                      className="block w-full text-left px-4 py-2.5 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Luxury Panjabi
                    </Link>
                  </div>
                )}
              </div>

              {/* Shirts - Mobile */}
              <Link
                href="/category/shirts"
                className="block w-full text-left px-4 py-3 text-gray-700 font-medium hover:bg-amber-50 rounded-lg border-b"
                onClick={() => setMobileMenuOpen(false)}
              >
                Shirts
              </Link>

              {/* All Collections - Mobile */}
              <Link
                href="/all-collections"
                className="block w-full text-left px-4 py-3 text-gray-700 font-medium hover:bg-amber-50 rounded-lg border-b"
                onClick={() => setMobileMenuOpen(false)}
              >
                All Collections
              </Link>

              {/* Popular Panjabi */}
              <Link
                href="/best-selling"
                className="block w-full text-left px-4 py-3 text-amber-600 font-medium hover:bg-amber-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                🔥 Popular Panjabi
              </Link>

              {/* New Arrivals */}
              <Link
                href="/new-arrivals"
                className="block w-full text-left px-4 py-3 text-rose-600 font-medium hover:bg-rose-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                ✨ New Arrivals
              </Link>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}



// client/src/components/Menu.tsx

// "use client";

// import Link from "next/link";
// import { useState, useRef, useEffect } from "react";
// import { ChevronDown, Menu as MenuIcon, X } from "lucide-react";

// interface MenuProps {
//   mobileMenuOpen: boolean;
//   setMobileMenuOpen: (open: boolean) => void;
// }

// export default function Menu({ mobileMenuOpen, setMobileMenuOpen }: MenuProps) {
//   const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
//   const categoryMenuRef = useRef<HTMLDivElement>(null);

//   // Shop by Category dropdown items
//   const categoryItems = [
//     { name: "All Categories", href: "#shopbycategory" },
//     { name: "Regular panjabi", href: "/category/regular-panjabi" },
//     { name: "Premium panjabi", href: "/category/premium-panjabi" },
//     { name: "Luxury Panjabi", href: "/category/luxury-panjabi" },
//   ];

//   // Close menu on outside click
//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       if (
//         categoryMenuOpen &&
//         categoryMenuRef.current &&
//         !categoryMenuRef.current.contains(e.target as Node)
//       ) {
//         setCategoryMenuOpen(false);
//       }
//     };
//     document.addEventListener("click", handleClickOutside);
//     return () => document.removeEventListener("click", handleClickOutside);
//   }, [categoryMenuOpen]);

//   return (
//     <>
//       {/* Desktop Menu */}
//       <div className="hidden lg:flex items-center justify-center py-3 border-t">
//         <nav className="flex items-center space-x-8">
//           {/* Shop by Category Dropdown */}
//           <div className="relative category-menu" ref={categoryMenuRef}>
//             <button
//               onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
//               className="flex items-center space-x-1 px-4 py-2 border text-slate-700 hover:text-amber-600 font-medium transition-colors cursor-pointer"
//             >
//               <span>Shop by Category</span>
//               <ChevronDown
//                 size={18}
//                 className={`transition-transform ${
//                   categoryMenuOpen ? "rotate-180" : ""
//                 }`}
//               />
//             </button>

//             {categoryMenuOpen && (
//               <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 shadow-lg z-50">
//                 {/* All Category (Different Style) */}
//                 <Link
//                   href="#shopbycategory"
//                   onClick={() => setCategoryMenuOpen(false)}
//                   className="
//                     block px-4 py-3
//                     bg-gradient-to-r from-amber-500 to-amber-400
//                     text-white font-semibold
//                     hover:from-amber-600 hover:to-amber-500
//                     transition-all
//                   "
//                 >
//                   All Categories
//                 </Link>

//                 {/* Divider */}
//                 <div className="h-px bg-slate-200"></div>

//                 {/* Other Categories */}
//                 <div className="py-2">
//                   {categoryItems
//                     .filter((item) => item.name !== "All Categories")
//                     .map((item) => (
//                       <Link
//                         key={item.name}
//                         href={item.href}
//                         className="
//                           relative flex items-center w-full
//                           px-4 py-2 text-gray-800 font-medium
//                           hover:bg-amber-50 transition-all group cursor-pointer
//                         "
//                         onClick={() => setCategoryMenuOpen(false)}
//                       >
//                         {/* Left hover bar */}
//                         <span
//                           className="
//                             absolute left-0 top-0 h-full w-[3px] bg-amber-500
//                             scale-y-0 group-hover:scale-y-100
//                             transition-transform origin-top rounded-r
//                           "
//                         ></span>

//                         <span className="ml-2 group-hover:text-amber-600">
//                           {item.name}
//                         </span>
//                       </Link>
//                     ))}
//                 </div>

//                 {/* Bottom 70% Border */}
//                 <div className="flex justify-center">
//                   <div className="w-[70%] h-1 bg-amber-500 rounded-full mb-1"></div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* All Collections - normal link */}
//           <Link
//             href="/all-collections"
//             className="px-4 py-2 text-slate-700 hover:text-slate-950 bg-amber-50 font-bold transition-colors cursor-pointer"
//           >
//             All Collections
//           </Link>

//           {/* Popular Panjabi */}
//           <Link
//             href="/best-selling"
//             className="px-4 py-2 text-amber-400 hover:text-amber-500 bg-slate-950 rounded-full font-medium transition-colors cursor-pointer"
//           >
//             Popular Panjabi
//           </Link>

//           {/* New Arrivals */}
//           <Link
//             href="/new-arrivals"
//             className="px-4 py-2 text-rose-600 hover:text-rose-700 font-bold transition-colors cursor-pointer"
//           >
//             New Arrivals
//           </Link>
//         </nav>
//       </div>

//       {/* Mobile Menu */}
//       {mobileMenuOpen && (
//         <div className="lg:hidden fixed inset-0 mt-28 top-[calc(56px+40px)] bg-white z-40 animate-slideIn">
//           <div className="p-4 border-t">
//             {/* Menu Items in Mobile */}
//             <div className="space-y-4 mb-6">
//               <h3 className="font-semibold text-gray-900 mb-3 px-2">Menu</h3>

//               {/* Shop by Category Dropdown */}
//               <div>
//                 <button
//                   onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
//                   className="flex items-center justify-between w-full px-4 py-3 text-gray-700 font-medium border-b"
//                 >
//                   <span>Shop by Category</span>
//                   <ChevronDown
//                     size={20}
//                     className={`transition-transform ${
//                       categoryMenuOpen ? "rotate-180" : ""
//                     }`}
//                   />
//                 </button>

//                 {categoryMenuOpen && (
//                   <div className="pl-4 mt-2 space-y-2">
//                     {categoryItems.map((item) => (
//                       <Link
//                         key={item.name}
//                         href={item.href}
//                         className="block w-full text-left px-4 py-2.5 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
//                         onClick={() => setMobileMenuOpen(false)}
//                       >
//                         {item.name}
//                       </Link>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* All Collections - Mobile */}
//               <Link
//                 href="/all-collections"
//                 className="block w-full text-left px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg border-b"
//                 onClick={() => setMobileMenuOpen(false)}
//               >
//                 All Collections
//               </Link>

//               {/* Popular Panjabi */}
//               <Link
//                 href="/best-selling"
//                 className="block w-full text-left px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg"
//                 onClick={() => setMobileMenuOpen(false)}
//               >
//                 Popular Panjabi
//               </Link>

//               {/* New Arrivals */}
//               <Link
//                 href="/new-arrival"
//                 className="block w-full text-left px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg"
//                 onClick={() => setMobileMenuOpen(false)}
//               >
//                 New Arrivals
//               </Link>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }