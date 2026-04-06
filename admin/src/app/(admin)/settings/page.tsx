// admin/src/app/settings/page.tsx

"use client";

import { useState, useEffect } from "react";
import { FiSave, FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errors, setErrors] = useState({});

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const token = localStorage.getItem("admin-token");
      if (!token) return;

      const response = await fetch(`${API_URL}/api/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          name: data.admin.name,
          email: data.admin.email,
        }));
      } else if (response.status === 401) {
        localStorage.removeItem("admin-token");
        localStorage.removeItem("admin-user");
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = "Current password required";
      }
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = "Password must be at least 6 characters";
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords don't match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const token = localStorage.getItem("admin-token");
      const response = await fetch(`${API_URL}/api/admin/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update");
      }

      if (data.token) {
        localStorage.setItem("admin-token", data.token);
      }

      // Update admin user data in localStorage
      if (data.admin) {
        localStorage.setItem("admin-user", JSON.stringify(data.admin));
      } else {
        // If admin not returned, update just the name in existing data
        const existingUser = localStorage.getItem("admin-user");
        if (existingUser) {
          const user = JSON.parse(existingUser);
          user.name = formData.name;
          user.email = formData.email;
          localStorage.setItem("admin-user", JSON.stringify(user));
        }
      }

      // ✅ Dispatch custom event to notify Topbar about the update
      window.dispatchEvent(new Event('profileUpdated'));

      toast.success("Settings updated successfully!");
      
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  const inputClasses = "w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-slate-800";
  const labelClasses = "block text-sm font-medium text-slate-700 mb-2";

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" />
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-600 mb-8">Manage your admin account</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FiUser className="text-amber-500" /> Profile Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    name="name" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    className={`${inputClasses} pl-10`} 
                  />
                </div>
              </div>
              <div>
                <label className={labelClasses}>Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    className={`${inputClasses} pl-10`} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FiLock className="text-amber-500" /> Change Password
            </h2>
            <div className="space-y-4">
              <div>
                <label className={labelClasses}>Current Password</label>
                <div className="relative">
                  <input 
                    type={showCurrentPassword ? "text" : "password"} 
                    value={formData.currentPassword} 
                    onChange={e => setFormData({...formData, currentPassword: e.target.value})} 
                    className={inputClasses} 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>New Password</label>
                  <input 
                    type={showNewPassword ? "text" : "password"} 
                    value={formData.newPassword} 
                    onChange={e => setFormData({...formData, newPassword: e.target.value})} 
                    className={inputClasses} 
                  />
                </div>
                <div>
                  <label className={labelClasses}>Confirm Password</label>
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={formData.confirmPassword} 
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                    className={inputClasses} 
                  />
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}