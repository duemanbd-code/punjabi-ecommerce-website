// admin/src/app/page.tsx

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldCheck, LayoutDashboard, LogOut } from "lucide-react";

export default function AdminWelcomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    setIsLoggedIn(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-500">
        Checking admin session...
      </div>
    );
  }

  // 🔒 Not logged in → redirect to login
  if (!isLoggedIn) {
    router.push("/login");
    return null;
  }

  // ✅ Logged in → Welcome screen
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        
        <div className="flex justify-center mb-4">
          <ShieldCheck className="w-14 h-14 text-amber-600" />
        </div>

        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Welcome, Admin
        </h1>

        <p className="text-slate-500 mb-8">
          You are logged in to the admin panel.  
          Manage products, orders, and settings from here.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-semibold transition"
          >
            <LayoutDashboard size={18} />
            Go to Dashboard
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("admin-token");
              router.push("/login");
            }}
            className="flex items-center justify-center gap-2 border border-slate-300 text-slate-600 hover:bg-slate-100 py-3 rounded-xl transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
