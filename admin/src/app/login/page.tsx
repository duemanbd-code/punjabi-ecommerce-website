// admin/src/app/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();
      
      // Debug: Log the response to see what the backend returns
      console.log("Response status:", res.status);
      console.log("Response data:", data);

      if (!res.ok) {
        // Handle different status codes with appropriate messages
        if (res.status === 401) {
          toast.error("Invalid email or password");
        } else if (res.status === 404) {
          toast.error("Admin account not found");
        } else if (res.status === 500) {
          toast.error("Server error. Please try again later.");
        } else {
          // Try to get error message from different possible fields
          const errorMessage = data.message || data.error || "Login failed. Please try again.";
          toast.error(errorMessage);
        }
        return; // Stop execution here
      }

      // Successful login
      const token = data.token;
      if (!token) {
        throw new Error("No token received from server");
      }

      // Store admin data
      localStorage.setItem("admin-token", token);
      localStorage.setItem("admin-user", JSON.stringify(data.admin || {}));

      toast.success("Login successful!");
      
      // Redirect to dashboard
      router.push("/dashboard");
      
    } catch (err: any) {
      console.error("Login error:", err);
      
      // Handle network errors
      if (
        err.message.includes("NetworkError") ||
        err.message.includes("Failed to fetch") ||
        err.name === "TypeError"
      ) {
        toast.error("Cannot connect to server. Please check your internet connection.");
      } else {
        toast.error(err.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">A</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Portal
          </h1>
          <p className="text-gray-600">Sign in to continue</p>
        </div>

        <form onSubmit={handleLogin} autoComplete="off" className="bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                name="email"
                autoComplete="off"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                required
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                name="password"
                autoComplete="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                required
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 text-white py-3 px-4 rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>
        
        {/* Optional: Add a note for demo */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Demo credentials: admin@example.com / admin123
        </p>
      </div>
    </div>
  );
}