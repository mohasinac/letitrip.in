"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserGuard } from "@/components/auth/AuthGuard";
import {
  User,
  Mail,
  Phone,
  Shield,
  Edit2,
  Save,
  X,
  LogOut,
  MapPin,
  Settings,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import AddressManager from "@/components/profile/AddressManager";
import ProfilePictureUpload from "@/components/profile/ProfilePictureUpload";
import PasswordChangeForm from "@/components/profile/PasswordChangeForm";
import AccountDeletion from "@/components/profile/AccountDeletion";
import { Address } from "@/types";

export default function ProfilePage() {
  return (
    <UserGuard>
      <ProfileContent />
    </UserGuard>
  );
}

function ProfileContent() {
  const { user, logout, updateProfile } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");

  // Add breadcrumb
  useBreadcrumbTracker([
    {
      label: "Profile",
      href: "/profile",
      active: true,
    },
  ]);

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateProfile({
        name,
        email,
        phone,
      });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddresses = async (addresses: Address[]) => {
    try {
      await updateProfile({ addresses });
    } catch (error: any) {
      throw error;
    }
  };

  const handleAvatarUpload = async (avatarUrl: string) => {
    try {
      await updateProfile({ avatar: avatarUrl });
    } catch (error: any) {
      throw error;
    }
  };

  const handlePasswordChange = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to change password");
      }
    } catch (error: any) {
      throw error;
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("/api/user/account", {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete account");
      }

      // Logout after deletion
      await logout();
    } catch (error: any) {
      throw error;
    }
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error: any) {
      toast.error("Failed to logout");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "seller":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "user":
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <ProfilePictureUpload
                  currentAvatar={user.avatar}
                  onUpload={handleAvatarUpload}
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.name}
                  </h1>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(
                    user.role,
                  )}`}
                >
                  {formatRole(user.role)}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Profile Information
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-gray-900 py-2">
                  {user.name || "Not provided"}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
                {user.isEmailVerified && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Verified
                  </span>
                )}
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email address"
                />
              ) : (
                <p className="text-gray-900 py-2">
                  {user.email || "Not provided"}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
                {user.isPhoneVerified && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Verified
                  </span>
                )}
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              ) : (
                <p className="text-gray-900 py-2">
                  {user.phone || "Not provided"}
                </p>
              )}
            </div>

            {/* Role Field (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Shield className="w-4 h-4 inline mr-2" />
                Account Role
              </label>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-3 py-2 rounded-lg text-sm font-medium border ${getRoleBadgeColor(
                    user.role,
                  )}`}
                >
                  {formatRole(user.role)}
                </span>
                <span className="text-xs text-gray-500">
                  Contact support to change your role
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Account Type
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatRole(user.role)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Email Status
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {user.isEmailVerified ? "Verified" : "Not Verified"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Phone Status
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {user.isPhoneVerified ? "Verified" : "Not Verified"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Address Management */}
        <div className="mt-6">
          <AddressManager
            addresses={user.addresses || []}
            onUpdate={handleUpdateAddresses}
            maxAddresses={5}
          />
        </div>

        {/* Actions */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Account Security
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PasswordChangeForm onPasswordChange={handlePasswordChange} />
            {!user.isEmailVerified && (
              <button className="flex items-center justify-center px-4 py-2 border border-blue-300 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                <Mail className="w-4 h-4 mr-2" />
                Verify Email
              </button>
            )}
            {!user.isPhoneVerified && (
              <button className="flex items-center justify-center px-4 py-2 border border-green-300 text-green-700 hover:bg-green-50 rounded-lg transition-colors">
                <Phone className="w-4 h-4 mr-2" />
                Verify Phone
              </button>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-red-200 p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-2 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Danger Zone
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Once you delete your account, there is no going back. Please be
            certain.
          </p>
          <AccountDeletion onDeleteAccount={handleDeleteAccount} />
        </div>
      </div>
    </div>
  );
}
