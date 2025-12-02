"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MapPin, Save, Camera, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth.service";
import { FormField, FormInput } from "@/components/forms";
import MediaUploader from "@/components/media/MediaUploader";
import { MediaFile } from "@/types/media";

export default function SettingsPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [avatarFiles, setAvatarFiles] = useState<MediaFile[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/user/settings");
      return;
    }

    // Load user data
    setFormData({
      name: user.fullName || "",
      email: user.email || "",
      phone: user.phoneNumber || "",
    });
  }, [user]);

  // Get user initials
  const getUserInitials = () => {
    if (!user) return "U";
    const name = user.displayName || user.fullName || user.email;
    if (!name) return "U";
    const names = name.split(" ").filter((n: string) => n.length > 0);
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const handleAvatarUpload = async (files: MediaFile[]) => {
    setAvatarFiles(files);
    if (files.length > 0 && files[0].preview) {
      try {
        setLoading(true);
        await authService.updateProfile({
          photoURL: files[0].preview,
        });
        setSuccess(true);
        setShowAvatarUpload(false);
        // Refresh user data
        if (refreshUser) {
          await refreshUser();
        }
        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update avatar.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await authService.updateProfile({
        fullName: formData.name,
        email: formData.email,
        phoneNumber: formData.phone,
      });

      setSuccess(true);
      if (refreshUser) {
        await refreshUser();
      }
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to update profile. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="user-settings-page" className="container mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Account Settings
      </h1>

      {/* Avatar Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Profile Picture
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Current Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-yellow-500 flex items-center justify-center">
              {user?.photoURL || user?.avatar ? (
                <Image
                  src={user.photoURL || user.avatar}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-900 font-bold text-3xl">
                  {getUserInitials()}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowAvatarUpload(!showAvatarUpload)}
              className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
              title="Change avatar"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center sm:text-left">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upload a profile picture to personalize your account.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Recommended: Square image, at least 200x200 pixels
            </p>
          </div>
        </div>

        {/* Avatar Upload Section */}
        {showAvatarUpload && (
          <div className="mt-6 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <MediaUploader
              accept="image"
              maxFiles={1}
              resourceType="user"
              multiple={false}
              files={avatarFiles}
              onFilesAdded={handleAvatarUpload}
              onFileRemoved={() => setAvatarFiles([])}
              enableCamera={true}
              enableVideoRecording={false}
              enableEditing={true}
              className="min-h-[150px]"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAvatarUpload(false);
                  setAvatarFiles([]);
                }}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Profile Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Profile Information
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <FormField label="Full Name" required>
            <FormInput
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              autoComplete="name"
            />
          </FormField>

          {/* Email */}
          <FormField
            label="Email Address"
            required
            hint="We'll send order confirmations to this email"
          >
            <FormInput
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              autoComplete="email"
            />
          </FormField>

          {/* Phone */}
          <FormField
            label="Phone Number"
            hint="Used for order updates and delivery coordination"
          >
            <FormInput
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="+91 9876543210"
              autoComplete="tel"
            />
          </FormField>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
              Profile updated successfully!
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 min-h-[48px] bg-primary text-white rounded-lg hover:bg-primary/90 active:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 touch-manipulation"
            >
              <Save className="w-4 h-4" />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Account Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Account Actions
        </h2>

        <div className="space-y-4">
          <button
            onClick={() => router.push("/user/addresses")}
            className="w-full text-left px-4 py-4 min-h-[64px] border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-colors touch-manipulation"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Manage Addresses
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Add, edit, or delete shipping addresses
                </div>
              </div>
              <MapPin className="w-5 h-5 text-gray-400" />
            </div>
          </button>

          <button
            onClick={() => router.push("/logout")}
            className="w-full text-left px-4 py-4 min-h-[64px] border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 active:bg-red-100 transition-colors text-red-600 dark:text-red-400 touch-manipulation"
          >
            <div className="font-medium">Log Out</div>
            <div className="text-sm">Sign out of your account</div>
          </button>
        </div>
      </div>
    </main>
  );
}
