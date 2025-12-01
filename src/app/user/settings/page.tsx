"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth.service";
import { FormField, FormInput } from "@/components/forms";

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      phone: "",
    });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await authService.updateProfile({
        fullName: formData.name,
        email: formData.email,
      });

      setSuccess(true);
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
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              autoComplete="name"
            />
          </FormField>

          {/* Email */}
          <FormField label="Email Address" required hint="We'll send order confirmations to this email">
            <FormInput
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              autoComplete="email"
            />
          </FormField>

          {/* Phone */}
          <FormField label="Phone Number" hint="Used for order updates and delivery coordination">
            <FormInput
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
