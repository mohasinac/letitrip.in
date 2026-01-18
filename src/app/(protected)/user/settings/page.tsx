"use client";

import MediaUploader from "@/components/media/MediaUploader";
import { DEFAULT_COUNTRY_CODE } from "@/constants/location";
import { NOTIFICATION_TIMINGS } from "@/constants/ui-constants";
import { useAuth } from "@/contexts/AuthContext";
import { logError } from "@/lib/firebase-error-logger";
import { authService } from "@/services/auth.service";
import { MediaFile } from "@/types/media";
import {
  FormField,
  FormInput,
  FormPhoneInput,
  SettingsSection,
  useLoadingState,
} from "@letitrip/react-library";
import { Camera, MapPin, Save } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [avatarFiles, setAvatarFiles] = useState<MediaFile[]>([]);
  const [success, setSuccess] = useState(false);
  const {
    isLoading: loading,
    error,
    execute,
  } = useLoadingState<void>({
    onLoadError: (err) => {
      logError(err, { component: "SettingsPage.updateProfile" });
    },
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    phoneCountryCode: DEFAULT_COUNTRY_CODE,
  });

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/user/settings");
      return;
    }

    // Load user data
    const phoneWithCode = user.phoneNumber || "";
    const countryCodeMatch = phoneWithCode.match(/^(\+\d+)/);
    const countryCode = countryCodeMatch
      ? countryCodeMatch[1]
      : DEFAULT_COUNTRY_CODE;
    const phoneOnly = phoneWithCode.replace(/^\+\d+\s*/, "");

    setFormData({
      name: user.fullName || "",
      email: user.email || "",
      phone: phoneOnly,
      phoneCountryCode: countryCode,
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
      await execute(async () => {
        await authService.updateProfile({
          photoURL: files[0].preview,
        });
        setSuccess(true);
        setShowAvatarUpload(false);
        // Refresh user data
        if (refreshUser) {
          await refreshUser();
        }
        setTimeout(
          () => setSuccess(false),
          NOTIFICATION_TIMINGS.SUCCESS_DURATION,
        );
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    await execute(async () => {
      await authService.updateProfile({
        fullName: formData.name,
        email: formData.email,
        phoneNumber: formData.phone
          ? `${formData.phoneCountryCode} ${formData.phone}`
          : undefined,
      });

      setSuccess(true);
      if (refreshUser) {
        await refreshUser();
      }
      setTimeout(
        () => setSuccess(false),
        NOTIFICATION_TIMINGS.SUCCESS_DURATION,
      );
    });
  };

  return (
    <main id="user-settings-page" className="container mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Account Settings
      </h1>

      {/* Avatar Section */}
      <SettingsSection
        title="Profile Picture"
        description="Upload a profile picture to personalize your account"
      >
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Current Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-yellow-500 flex items-center justify-center">
              {user?.photoURL ? (
                <Image
                  src={user.photoURL}
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
            <p className="text-xs text-gray-500 dark:text-gray-500">
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
      </SettingsSection>

      {/* Profile Form */}
      <SettingsSection title="Profile Information">
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
            <FormPhoneInput
              value={formData.phone}
              countryCode={formData.phoneCountryCode}
              onChange={(phone, countryCode) =>
                setFormData({
                  ...formData,
                  phone,
                  phoneCountryCode: countryCode,
                })
              }
              placeholder="9876543210"
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
              {error.message || "Failed to update profile. Please try again."}
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
      </SettingsSection>

      {/* Account Actions */}
      <SettingsSection title="Account Actions" className="mb-0">
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
      </SettingsSection>
    </main>
  );
}
