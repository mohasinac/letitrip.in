"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, MapPin, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth.service";

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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {/* TODO: Replace with constant */}
        Account Settings
      </h1>

      {/* Profile Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {/* TODO: Replace with constant */}
          Profile Information
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              {/* TODO: Replace with constant */}
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              {/* TODO: Replace with constant */}
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {/* TODO: Replace with constant */}
              We'll send order confirmations to this email
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              {/* TODO: Replace with constant */}
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="+91 9876543210" // TODO: Make dynamic based on country
            />
            <p className="text-xs text-gray-500 mt-1">
              {/* TODO: Replace with constant */}
              Used for order updates and delivery coordination
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {/* TODO: Replace with constant */}
              Profile updated successfully!
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {/* TODO: Replace with constant */}
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {/* TODO: Replace with constant */}
          Account Actions
        </h2>

        <div className="space-y-4">
          <button
            onClick={() => router.push("/user/addresses")}
            className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">
                  {/* TODO: Replace with constant */}
                  Manage Addresses
                </div>
                <div className="text-sm text-gray-600">
                  {/* TODO: Replace with constant */}
                  Add, edit, or delete shipping addresses
                </div>
              </div>
              <MapPin className="w-5 h-5 text-gray-400" />
            </div>
          </button>

          <button
            onClick={() => router.push("/logout")}
            className="w-full text-left px-4 py-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-600"
          >
            <div className="font-medium">
              {/* TODO: Replace with constant */}
              Log Out
            </div>
            <div className="text-sm">
              {/* TODO: Replace with constant */}
              Sign out of your account
            </div>
          </button>
        </div>
      </div>
    </main>
  );
}
