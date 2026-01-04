// admin/src/app/settings/page.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { 
  FiSave, FiUser, FiMail, FiLock, FiBell, FiGlobe, 
  FiEye, FiEyeOff, FiUpload, FiCamera, FiTrash2 
} from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";
import Image from "next/image";

type SettingsForm = {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  notifications: boolean;
  language: string;
  timezone: string;
  profilePicture: string | File | null;
  logo: string | File | null;
};

export default function SettingsPage() {
  const [formData, setFormData] = useState<SettingsForm>({
    name: "Admin User",
    email: "admin@example.com",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    notifications: true,
    language: "en",
    timezone: "UTC",
    profilePicture: "/default-avatar.png", // Default profile picture
    logo: "/default-logo.png", // Default logo
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<"profile" | "logo" | null>(null);
  const [profilePreview, setProfilePreview] = useState<string>("");
  const [logoPreview, setLogoPreview] = useState<string>("");

  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Initialize previews
  useEffect(() => {
    if (typeof formData.profilePicture === "string") {
      setProfilePreview(formData.profilePicture);
    } else if (formData.profilePicture instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(formData.profilePicture);
    }

    if (typeof formData.logo === "string") {
      setLogoPreview(formData.logo);
    } else if (formData.logo instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(formData.logo);
    }
  }, [formData.profilePicture, formData.logo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageUpload = async (type: "profile" | "logo", file: File) => {
    const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    
    if (!validImageTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, GIF, WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadingImage(type);

    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (type === "profile") {
        setFormData(prev => ({ ...prev, profilePicture: file }));
        toast.success("Profile picture updated successfully!");
      } else {
        setFormData(prev => ({ ...prev, logo: file }));
        toast.success("Logo updated successfully!");
      }
    } catch (error) {
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: "profile" | "logo") => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(type, file);
    }
  };

  const removeImage = (type: "profile" | "logo") => {
    const defaultImage = type === "profile" ? "/default-avatar.png" : "/default-logo.png";
    
    if (type === "profile") {
      setFormData(prev => ({ ...prev, profilePicture: defaultImage }));
      setProfilePreview(defaultImage);
      toast.success("Profile picture removed");
    } else {
      setFormData(prev => ({ ...prev, logo: defaultImage }));
      setLogoPreview(defaultImage);
      toast.success("Logo removed");
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return false;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords don't match");
      return false;
    }

    if (formData.newPassword && formData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }

    if (formData.currentPassword && !formData.newPassword) {
      toast.error("Please enter a new password");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Create FormData to handle file uploads
    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("email", formData.email);
    submitData.append("currentPassword", formData.currentPassword);
    submitData.append("newPassword", formData.newPassword);
    submitData.append("notifications", formData.notifications.toString());
    submitData.append("language", formData.language);
    submitData.append("timezone", formData.timezone);
    
    if (formData.profilePicture instanceof File) {
      submitData.append("profilePicture", formData.profilePicture);
    }
    
    if (formData.logo instanceof File) {
      submitData.append("logo", formData.logo);
    }

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real implementation, you would:
      // const response = await fetch('/api/settings', {
      //   method: 'POST',
      //   body: submitData,
      // });
      
      setIsLoading(false);
      toast.success("Settings updated successfully!");
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      setIsLoading(false);
      toast.error("Failed to update settings. Please try again.");
    }
  };

  const inputClasses = "w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors bg-white text-slate-800 placeholder-slate-400";
  const labelClasses = "block text-sm font-medium text-slate-700 mb-2";
  const sectionHeaderClasses = "text-lg font-semibold text-slate-900";
  const sectionDescriptionClasses = "text-sm text-slate-600";

  return (
    <div className="flex min-h-screen bg-white">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #334155',
          },
          success: {
            iconTheme: {
              primary: '#f59e0b',
              secondary: '#1e293b',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#1e293b',
            },
          },
        }}
      />
      
      {/* Sidebar */}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}

        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
              <p className="text-slate-600 mt-2">
                Manage your account settings and preferences
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Profile Picture & Logo Section */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                    <FiCamera className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className={sectionHeaderClasses}>Profile & Logo</h2>
                    <p className={sectionDescriptionClasses}>Update your profile picture and system logo</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Profile Picture Upload */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-slate-900">Profile Picture</h3>
                    <div className="flex items-center gap-6">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 group-hover:border-amber-500 transition-colors">
                          {profilePreview ? (
                            <div className="relative w-full h-full">
                              <Image
                                src={profilePreview}
                                alt="Profile preview"
                                fill
                                className="object-cover"
                                sizes="96px"
                              />
                            </div>
                          ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                              <FiUser className="w-10 h-10 text-slate-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Remove button */}
                        {formData.profilePicture !== "/default-avatar.png" && (
                          <button
                            type="button"
                            onClick={() => removeImage("profile")}
                            className="absolute -top-1 -right-1 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="flex-1 space-y-3">
                        <button
                          type="button"
                          onClick={() => profileFileInputRef.current?.click()}
                          disabled={uploadingImage === "profile"}
                          className="w-full px-4 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiUpload className="w-4 h-4" />
                          {uploadingImage === "profile" ? "Uploading..." : "Upload New Photo"}
                        </button>
                        <input
                          ref={profileFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, "profile")}
                          className="hidden"
                        />
                        
                        <p className="text-xs text-slate-500">
                          Recommended: Square image, at least 400x400px. Max size: 5MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Logo Upload */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-slate-900">System Logo</h3>
                    <div className="flex items-center gap-6">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-slate-200 group-hover:border-amber-500 transition-colors bg-white p-3">
                          {logoPreview ? (
                            <div className="relative w-full h-full">
                              <Image
                                src={logoPreview}
                                alt="Logo preview"
                                fill
                                className="object-contain"
                                sizes="96px"
                              />
                            </div>
                          ) : (
                            <div className="w-full h-full bg-slate-50 flex items-center justify-center rounded">
                              <FiGlobe className="w-10 h-10 text-slate-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Remove button */}
                        {formData.logo !== "/default-logo.png" && (
                          <button
                            type="button"
                            onClick={() => removeImage("logo")}
                            className="absolute -top-1 -right-1 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="flex-1 space-y-3">
                        <button
                          type="button"
                          onClick={() => logoFileInputRef.current?.click()}
                          disabled={uploadingImage === "logo"}
                          className="w-full px-4 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiUpload className="w-4 h-4" />
                          {uploadingImage === "logo" ? "Uploading..." : "Upload New Logo"}
                        </button>
                        <input
                          ref={logoFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, "logo")}
                          className="hidden"
                        />
                        
                        <p className="text-xs text-slate-500">
                          Recommended: Transparent PNG, at least 200x200px. Max size: 5MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Section */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                    <FiUser className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className={sectionHeaderClasses}>Profile Information</h2>
                    <p className={sectionDescriptionClasses}>Update your personal details</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className={labelClasses}>
                      Full Name
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className={`${inputClasses} pl-10`}
                        placeholder="Enter your name"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className={labelClasses}>
                      Email Address
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`${inputClasses} pl-10`}
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                    <FiLock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className={sectionHeaderClasses}>Security</h2>
                    <p className={sectionDescriptionClasses}>Update your password</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className={labelClasses}>
                      Current Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        id="currentPassword"
                        name="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className={`${inputClasses} pl-10 pr-10`}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-amber-600 transition-colors"
                      >
                        {showCurrentPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="newPassword" className={labelClasses}>
                        New Password
                      </label>
                      <div className="relative">
                        <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                          id="newPassword"
                          name="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={formData.newPassword}
                          onChange={handleChange}
                          className={`${inputClasses} pl-10 pr-10`}
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-amber-600 transition-colors"
                        >
                          {showNewPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className={labelClasses}>
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className={`${inputClasses} pl-10 pr-10`}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-amber-600 transition-colors"
                        >
                          {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferences Section */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                    <FiBell className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className={sectionHeaderClasses}>Preferences</h2>
                    <p className={sectionDescriptionClasses}>Customize your experience</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="language" className={labelClasses}>
                      Language
                    </label>
                    <div className="relative">
                      <FiGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <select
                        id="language"
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                        className={`${inputClasses} pl-10 cursor-pointer appearance-none`}
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="timezone" className={labelClasses}>
                      Timezone
                    </label>
                    <select
                      id="timezone"
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleChange}
                      className={`${inputClasses} cursor-pointer appearance-none`}
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time (EST)</option>
                      <option value="PST">Pacific Time (PST)</option>
                      <option value="CET">Central European Time (CET)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center gap-3">
                    <input
                      id="notifications"
                      name="notifications"
                      type="checkbox"
                      checked={formData.notifications}
                      onChange={handleChange}
                      className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 focus:ring-offset-0 border-slate-300"
                    />
                    <label htmlFor="notifications" className="text-slate-700">
                      Receive email notifications
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      name: "Admin User",
                      email: "admin@example.com",
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                      notifications: true,
                      language: "en",
                      timezone: "UTC",
                      profilePicture: "/default-avatar.png",
                      logo: "/default-logo.png",
                    });
                    toast.success("All settings reset to default");
                  }}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  Reset All
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-950 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
                >
                  <FiSave className="w-5 h-5" />
                  {isLoading ? "Saving..." : "Save All Changes"}
                </button>
              </div>
            </form>

            {/* Additional Settings Sections */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <FiGlobe className="w-5 h-5 text-slate-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Appearance</h3>
                </div>
                <p className="text-sm text-slate-600 mb-4">Customize theme and layout</p>
                <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                  Configure →
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <FiBell className="w-5 h-5 text-slate-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Notifications</h3>
                </div>
                <p className="text-sm text-slate-600 mb-4">Manage notification preferences</p>
                <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                  Configure →
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <FiLock className="w-5 h-5 text-slate-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Privacy</h3>
                </div>
                <p className="text-sm text-slate-600 mb-4">Control your privacy settings</p>
                <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                  Configure →
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}