// admin/src/components/Topbar.tsx

"use client";

import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";

export default function Topbar() {
  const router = useRouter();
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    // Get admin name from localStorage
    const adminUser = localStorage.getItem("admin-user");
    if (adminUser) {
      try {
        const user = JSON.parse(adminUser);
        setAdminName(user.name || "Admin");
      } catch (error) {
        console.error("Error parsing admin user:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    console.log("Logging out..."); // Debug log
    // Clear admin session
    localStorage.removeItem("admin-token");
    localStorage.removeItem("admin-user");
    
    // Redirect to login page
    router.push("/login");
  };

  return (
    <header className="h-16 bg-white shadow-md flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left: Title */}
      <h1 className="font-bold text-xl text-gray-800">Admin Panel</h1>

      {/* Right: User & Logout */}
      <div className="flex items-center gap-4">
        {/* User info */}
        <div className="flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-full hover:bg-amber-100 transition">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shadow-md">
            <User size={18} className="text-white" />
          </div>
          <span className="text-gray-800 font-medium text-sm">
            {adminName || "Admin"}
          </span>
        </div>

        {/* Logout button - WITH onClick HANDLER */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-red-600 font-medium rounded-lg shadow-md transition cursor-pointer"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}