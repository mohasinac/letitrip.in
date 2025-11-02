"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  Settings,
  Globe,
  Bell,
  Lock,
  Trash2,
  Loader2,
  ArrowLeft,
  Save,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotionalEmails, setPromotionalEmails] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/profile/settings");
      return;
    }

    if (user) {
      // Load user preferences from API or local storage
      loadPreferences();
    }
  }, [user, authLoading]);

  const loadPreferences = async () => {
    try {
      // Load from localStorage for now
      const savedPrefs = localStorage.getItem("userPreferences");
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        setEmailNotifications(prefs.emailNotifications ?? true);
        setOrderUpdates(prefs.orderUpdates ?? true);
        setPromotionalEmails(prefs.promotionalEmails ?? false);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      const preferences = {
        emailNotifications,
        orderUpdates,
        promotionalEmails,
      };

      // Save to localStorage
      localStorage.setItem("userPreferences", JSON.stringify(preferences));

      // Optionally save to backend
      if (user && (user as any).getIdToken) {
        const token = await (user as any).getIdToken();
        await fetch("/api/users/preferences", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(preferences),
        });
      }

      toast.success("Settings saved successfully");
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencyChange = async (newCurrency: string) => {
    try {
      await setCurrency(newCurrency, user?.id);
      toast.success("Currency updated");
    } catch (error) {
      toast.error("Failed to update currency");
    }
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-4 no-underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Account Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account preferences
          </p>
        </div>

        {/* Currency Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Currency Preference
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Choose your preferred currency for displaying prices
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {currencies.map((curr) => (
              <button
                key={curr.code}
                onClick={() => handleCurrencyChange(curr.code)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  currency === curr.code
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
                }`}
              >
                <p className="text-2xl mb-1">{curr.symbol}</p>
                <p className="font-medium text-sm text-gray-900 dark:text-white">
                  {curr.code}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {curr.name}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Notifications
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Manage how you receive notifications
          </p>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Email Notifications
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive notifications via email
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Order Updates
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get updates about your orders
                </p>
              </div>
              <input
                type="checkbox"
                checked={orderUpdates}
                onChange={(e) => setOrderUpdates(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Promotional Emails
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive offers and promotions
                </p>
              </div>
              <input
                type="checkbox"
                checked={promotionalEmails}
                onChange={(e) => setPromotionalEmails(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>

          <button
            onClick={handleSavePreferences}
            disabled={loading}
            className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Preferences
              </>
            )}
          </button>
        </div>

        {/* Security Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Security
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Manage your account security
          </p>

          <Link
            href="/profile/change-password"
            className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 no-underline group"
          >
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Change Password
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Update your account password
              </p>
            </div>
            <Lock className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </Link>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl shadow-lg border border-red-200 dark:border-red-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Danger Zone
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Irreversible actions
          </p>

          <Link
            href="/profile/delete-account"
            className="flex items-center justify-between p-4 rounded-lg border-2 border-red-600 dark:border-red-500 hover:bg-red-600 dark:hover:bg-red-500 hover:text-white transition-all duration-200 no-underline group"
          >
            <div>
              <p className="font-medium text-red-600 dark:text-red-400 group-hover:text-white">
                Delete Account
              </p>
              <p className="text-sm text-red-600/80 dark:text-red-400/80 group-hover:text-white/80">
                Permanently delete your account and data
              </p>
            </div>
            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400 group-hover:text-white" />
          </Link>
        </div>
      </div>
    </div>
  );
}
