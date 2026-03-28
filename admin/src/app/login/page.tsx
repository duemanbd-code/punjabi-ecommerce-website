// admin/src/app/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous error
    setError("");

    if (!email || !password) {
      setError("Please fill all fields");
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

      if (!res.ok) {
        // Handle different status codes
        if (res.status === 401) {
          setError("Invalid email or password");
        } else if (res.status === 404) {
          setError("Admin account not found");
        } else if (res.status === 500) {
          setError("Server error. Please try again later.");
        } else {
          const errorMessage = data.message || data.error || "Login failed. Please try again.";
          setError(errorMessage);
        }
        setLoading(false);
        return;
      }

      // Successful login
      const token = data.token;
      if (!token) {
        setError("No token received from server");
        setLoading(false);
        return;
      }

      // Store admin data
      localStorage.setItem("admin-token", token);
      localStorage.setItem("admin-user", JSON.stringify(data.admin || {}));

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
        setError("Cannot connect to server. Please check your internet connection.");
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">A</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Portal
          </h1>
          <p className="text-gray-600">Sign in to continue</p>
        </div>

        <form onSubmit={handleLogin} autoComplete="off" className="bg-white rounded-2xl shadow-xl p-8">
          {/* Error Message - Red Text */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center font-medium">
                {error}
              </p>
            </div>
          )}

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
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(""); // Clear error when user starts typing
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                  error ? "border-red-500" : "border-gray-300"
                }`}
                required
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(""); // Clear error when user starts typing
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                  error ? "border-red-500" : "border-gray-300"
                }`}
                required
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
      </div>
    </div>
  );
}