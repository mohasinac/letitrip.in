"use client";

import { useState, useEffect } from "react";
import { useEnhancedAuth } from "@/hooks/useEnhancedAuth";
import { useRealTimeData } from "@/hooks/useRealTimeData";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  avatar?: string;
  bio?: string;
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    marketingEmails: boolean;
    orderUpdates: boolean;
    auctionAlerts: boolean;
    newsletter: boolean;
  };
  privacy: {
    profileVisibility: "public" | "private";
    showPurchaseHistory: boolean;
    showWishlist: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
    loginAttempts: number;
  };
}

export default function ProfilePage() {
  const { user } = useEnhancedAuth();

  const fetchProfile = async () => {
    const response = await fetch("/api/user/profile", {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch profile");
    }
    return await response.json();
  };

  const {
    data: profile,
    loading,
    error,
    refresh,
  } = useRealTimeData(fetchProfile, {
    enabled: !!user,
    interval: 60000, // Refresh every minute
  });

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileUpdate = async (updatedProfile: Partial<UserProfile>) => {
    setSaving(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatedProfile),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Refresh the profile data
      await refresh();
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match!");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      alert("Password must be at least 8 characters long!");
      return;
    }

    setSaving(true);

    try {
      // Update password via API
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        alert("Password updated successfully!");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Password update error:", error);
      alert("Failed to update password. Please try again.");
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!profile) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Profile Not Found
            </h1>
            <p className="text-gray-600">
              Unable to load your profile information.
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Profile Settings
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your account information and preferences
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Profile Sidebar */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                {/* Profile Picture */}
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="h-12 w-12 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {profile.firstName} {profile.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{profile.email}</p>
                  <button className="mt-3 btn btn-outline btn-sm">
                    Change Photo
                  </button>
                </div>

                {/* Quick Stats */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-medium">Jan 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Orders</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Wishlist Items</span>
                    <span className="font-medium">8</span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="bg-white rounded-lg shadow-sm border p-2">
                {[
                  { id: "profile", name: "Personal Info", icon: "👤" },
                  { id: "security", name: "Security", icon: "🔒" },
                  { id: "notifications", name: "Notifications", icon: "🔔" },
                  { id: "privacy", name: "Privacy", icon: "🛡️" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="mr-3">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              {/* Personal Info Tab */}
              {activeTab === "profile" && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Personal Information
                  </h2>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const updatedProfile = {
                        firstName: formData.get("firstName") as string,
                        lastName: formData.get("lastName") as string,
                        phone: formData.get("phone") as string,
                        dateOfBirth: formData.get("dateOfBirth") as string,
                        gender: formData.get("gender") as string,
                        bio: formData.get("bio") as string,
                      };
                      handleProfileUpdate(updatedProfile);
                    }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          defaultValue={profile.firstName}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          defaultValue={profile.lastName}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Email cannot be changed
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        defaultValue={profile.phone}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          defaultValue={profile.dateOfBirth}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Gender
                        </label>
                        <select
                          name="gender"
                          defaultValue={profile.gender}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Prefer not to say</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        defaultValue={profile.bio}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="btn btn-primary disabled:opacity-50"
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  {/* Change Password */}
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                      Change Password
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              currentPassword: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              newPassword: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              confirmPassword: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <button
                        onClick={handlePasswordChange}
                        disabled={saving}
                        className="btn btn-primary disabled:opacity-50"
                      >
                        {saving ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Two-Factor Authentication
                    </h2>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600">
                          Add an extra layer of security to your account
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Status:{" "}
                          {profile.security.twoFactorEnabled
                            ? "Enabled"
                            : "Disabled"}
                        </p>
                      </div>
                      <button className="btn btn-outline">
                        {profile.security.twoFactorEnabled
                          ? "Disable"
                          : "Enable"}{" "}
                        2FA
                      </button>
                    </div>
                  </div>

                  {/* Login History */}
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Security Information
                    </h2>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Last Password Change
                        </span>
                        <span>
                          {new Date(
                            profile.security.lastPasswordChange
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Failed Login Attempts
                        </span>
                        <span>{profile.security.loginAttempts}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Notification Preferences
                  </h2>

                  <div className="space-y-6">
                    {Object.entries(profile.preferences).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </p>
                          <p className="text-sm text-gray-600">
                            {key === "emailNotifications" &&
                              "Receive important updates via email"}
                            {key === "smsNotifications" &&
                              "Get text messages for urgent updates"}
                            {key === "marketingEmails" &&
                              "Promotional offers and deals"}
                            {key === "orderUpdates" &&
                              "Order status and shipping updates"}
                            {key === "auctionAlerts" &&
                              "Auction bidding and ending notifications"}
                            {key === "newsletter" &&
                              "Weekly newsletter with new products"}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(value)}
                            onChange={(e) => {
                              const updatedPreferences = {
                                ...profile.preferences,
                                [key]: e.target.checked,
                              };
                              handleProfileUpdate({
                                preferences: updatedPreferences,
                              });
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === "privacy" && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Privacy Settings
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profile Visibility
                      </label>
                      <select
                        value={profile.privacy.profileVisibility}
                        onChange={(e) => {
                          const updatedPrivacy = {
                            ...profile.privacy,
                            profileVisibility: e.target.value as
                              | "public"
                              | "private",
                          };
                          handleProfileUpdate({ privacy: updatedPrivacy });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                      </select>
                    </div>

                    {Object.entries(profile.privacy)
                      .filter(([key]) => key !== "profileVisibility")
                      .map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {key
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                            </p>
                            <p className="text-sm text-gray-600">
                              {key === "showPurchaseHistory" &&
                                "Allow others to see your purchase history"}
                              {key === "showWishlist" &&
                                "Make your wishlist visible to others"}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={
                                typeof value === "boolean" ? value : false
                              }
                              onChange={(e) => {
                                const updatedPrivacy = {
                                  ...profile.privacy,
                                  [key]: e.target.checked,
                                };
                                handleProfileUpdate({
                                  privacy: updatedPrivacy,
                                });
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                      ))}

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Data Management
                      </h3>
                      <div className="space-y-3">
                        <button className="btn btn-outline w-full">
                          Download My Data
                        </button>
                        <button className="btn btn-outline w-full text-red-600 border-red-300 hover:bg-red-50">
                          Delete My Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
