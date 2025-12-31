// admin/src/components/Topbar.tsx

"use client";

import { User, LogOut } from "lucide-react";

export default function Topbar() {
  return (
    <header className="h-16 bg-white shadow-md flex items-center justify-between px-6">
      {/* Left: Title */}
      <h1 className="font-bold text-xl text-gray-800">Admin Panel</h1>

      {/* Right: User & Logout */}
      <div className="flex items-center gap-4">
        {/* User info */}
        {/* <div className="flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-full hover:bg-amber-100 transition">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shadow-md">
            <User size={18} className="text-white" />
          </div>
          <span className="text-gray-800 font-medium text-sm">Owner Name</span>
        </div> */}

        {/* Logout button */}
        <button className="flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-red-600 font-medium rounded-lg shadow-md transition cursor-pointer">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}
