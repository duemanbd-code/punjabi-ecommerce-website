// admin/src/components/AdminSidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  Settings,
  ChevronRight,
  LogOut,
  User,
  PlusCircle,
  List,
} from "lucide-react";
import { useState } from "react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    products: pathname?.includes("/products") || false,
  });

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const isActive = (href: string) => pathname === href;
  const isProductsActive =
    pathname?.includes("/products") || pathname?.includes("/categories");

  const menuItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      key: "products",
      label: "Products",
      icon: Package,
      isActive: isProductsActive,
      submenu: [
        {
          href: "/products",
          label: "All Products",
          icon: List,
          badge: "",
        },
        {
          href: "/products/add",
          label: "Add Product",
          icon: PlusCircle,
          badge: null,
        },
      ],
    },
    {
      href: "/orders",
      label: "Orders",
      icon: ShoppingCart,
      badge: "",
    },
    // {
    //   href: "/customers",
    //   label: "Customers",
    //   icon: Users,
    //   badge: "156"
    // },
    {
      href: "/inventory",
      label: "Inventory",
      icon: Warehouse,
      badge: null,
    },
    // {
    //   href: "/settings",
    //   label: "Settings",
    //   icon: Settings,
    //   badge: null,
    // },
  ];

  return (
    <aside className="w-72 bg-white min-h-screen p-6 flex flex-col border-r border-gray-100 shadow-xl relative overflow-hidden">
      {/* Amber accent line */}
      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600"></div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-10 px-2 py-3 pl-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-2 ring-amber-500/20">
          <span className="font-bold text-xl text-white">A</span>
        </div>
        <div>
          <h2 className="font-bold text-2xl text-slate-900 bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent">
            Admin Panel
          </h2>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2">
        {/* FIXED: Changed <p> to <div> to avoid div inside p */}
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-3 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
          Navigation Menu
        </div>
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = "href" in item ? isActive(item.href) : item.isActive;

            if ("submenu" in item) {
              return (
                <div key={item.key} className="mb-1">
                  <button
                    onClick={() => toggleMenu(item.key)}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-300 group ${
                      active
                        ? "bg-amber-50/80 border border-amber-200 shadow-md"
                        : "hover:bg-gray-50 hover:border-gray-200 hover:shadow-sm"
                    } border border-transparent`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2.5 rounded-xl transition-all duration-300 ${
                          active
                            ? "bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/30"
                            : "bg-gray-100 group-hover:bg-amber-50"
                        }`}
                      >
                        <Icon
                          size={20}
                          className={
                            active
                              ? "text-white"
                              : "text-gray-600 group-hover:text-amber-600"
                          }
                        />
                      </div>
                      <span
                        className={`font-semibold ${
                          active
                            ? "text-amber-700"
                            : "text-gray-700 group-hover:text-gray-900"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="px-2 py-1 text-xs font-bold bg-amber-500 text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight
                        size={18}
                        className={`transform transition-transform duration-300 ${
                          openMenus[item.key]
                            ? "rotate-90 text-amber-600"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                  </button>

                  {openMenus[item.key] && (
                    <div className="ml-10 mt-2 space-y-1.5 animate-slideDown">
                      {item.submenu.map((sublink) => {
                        const SubIcon = sublink.icon;
                        const subActive = isActive(sublink.href);

                        return (
                          <Link
                            key={sublink.href}
                            href={sublink.href}
                            className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-300 group ${
                              subActive
                                ? "bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 shadow-sm"
                                : "hover:bg-gray-50 hover:border-gray-100 hover:shadow-sm"
                            } border border-transparent`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-1.5 rounded-lg transition-colors duration-300 ${
                                  subActive
                                    ? "bg-amber-500/20"
                                    : "bg-gray-100 group-hover:bg-amber-50/50"
                                }`}
                              >
                                <SubIcon
                                  size={16}
                                  className={
                                    subActive
                                      ? "text-amber-600"
                                      : "text-gray-500 group-hover:text-amber-600"
                                  }
                                />
                              </div>
                              <span
                                className={`font-medium text-sm ${
                                  subActive
                                    ? "text-amber-700 font-semibold"
                                    : "text-gray-600 group-hover:text-gray-900"
                                }`}
                              >
                                {sublink.label}
                              </span>
                            </div>
                            {sublink.badge && (
                              <span
                                className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                                  subActive
                                    ? "bg-amber-500 text-white"
                                    : "bg-gray-200 text-gray-700 group-hover:bg-amber-100 group-hover:text-amber-700"
                                }`}
                              >
                                {sublink.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  active
                    ? "bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 shadow-md"
                    : "hover:bg-gray-50 hover:border-gray-200 hover:shadow-sm"
                } border border-transparent`}
              >
                {/* Active indicator */}
                {active && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 to-amber-500 rounded-r-full"></div>
                )}

                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl transition-all duration-300 ${
                      active
                        ? "bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/30"
                        : "bg-gray-100 group-hover:bg-amber-50"
                    }`}
                  >
                    <Icon
                      size={20}
                      className={
                        active
                          ? "text-white"
                          : "text-gray-600 group-hover:text-amber-600"
                      }
                    />
                  </div>
                  <span
                    className={`font-semibold ${
                      active
                        ? "text-amber-700"
                        : "text-gray-700 group-hover:text-gray-900"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded-full ${
                        active
                          ? "bg-amber-500 text-white shadow"
                          : "bg-gray-200 text-gray-700 group-hover:bg-amber-100 group-hover:text-amber-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {active && (
                    <ChevronRight
                      size={18}
                      className="text-amber-600 animate-pulse"
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-100 px-2">
        {/* Logout Button */}
        <button className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border border-gray-200 transition-all duration-300 hover:shadow-md group">
          <div className="p-2 rounded-lg bg-white group-hover:bg-red-50 transition-colors duration-300 shadow-sm">
            <LogOut
              size={18}
              className="text-gray-600 group-hover:text-red-600 transition-colors duration-300"
            />
          </div>
          <span className="font-semibold text-gray-700 group-hover:text-gray-900">
            Logout
          </span>
        </button>

        <div className="text-center mt-4">
          <p className="text-xs text-gray-500 font-medium">
            v1.1 © 2025 Admin Panel
          </p>
        </div>
      </div>
    </aside>
  );
}
