"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  BuildingStorefrontIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

interface StoreSettings {
  storeName: string;
  storeStatus: "live" | "maintenance" | "offline";
  storeDescription: string;
  businessName: string;
}

export default function StoreSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: "",
    storeStatus: "offline", // Default to offline until seller sets it up
    storeDescription: "",
    businessName: "",
  });

  // Load existing settings
  useEffect(() => {
    loadStoreSettings();
  }, [user?.id]);

  const loadStoreSettings = async () => {
    if (!user?.id || !user.getIdToken) return;

    setLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/seller/store-settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings({
          storeName: data.storeName || "",
          storeStatus: data.storeStatus || "offline", // Default to offline
          storeDescription: data.storeDescription || "",
          businessName: data.businessName || "",
        });
      }
    } catch (error) {
      console.error("Failed to load store settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Debug logging
    console.log("Save button clicked");
    console.log("User:", user);
    console.log("Settings:", settings);

    if (!user?.id || !user.getIdToken) {
      console.error("User not authenticated or getIdToken not available");
      toast.error("Please log in to save settings");
      return;
    }

    if (!settings.storeName.trim()) {
      toast.error("Store name is required");
      return;
    }

    setSaving(true);
    try {
      const token = await user.getIdToken();
      console.log("Got token, making API request...");

      const response = await fetch(`/api/seller/store-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      console.log("API Response status:", response.status);
      const responseData = await response.json();
      console.log("API Response data:", responseData);

      if (response.ok) {
        toast.success("Store settings updated successfully!");
      } else {
        toast.error(responseData.error || "Failed to update settings");
        throw new Error(responseData.error || "Failed to update settings");
      }
    } catch (error) {
      console.error("Failed to save store settings:", error);
      toast.error("Failed to update store settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "text-green-600 bg-green-50 border-green-200";
      case "maintenance":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "offline":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "live":
        return <CheckCircleIcon className="w-5 h-5" />;
      case "maintenance":
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case "offline":
        return <GlobeAltIcon className="w-5 h-5" />;
      default:
        return <BuildingStorefrontIcon className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Store Name */}
      <div>
        <label
          htmlFor="storeName"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Store Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="storeName"
            type="text"
            value={settings.storeName}
            onChange={(e) =>
              setSettings({ ...settings, storeName: e.target.value })
            }
            placeholder="Enter your store name (e.g., 'Battle Arena Pro Shop')"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              !settings.storeName.trim()
                ? "border-red-300 bg-red-50"
                : "border-gray-300"
            }`}
            maxLength={50}
            required
          />
          <BuildingStorefrontIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          This name will be displayed to customers when they view your products.
          If not set, it defaults to "[Your Name]'s Store".
        </p>
      </div>

      {/* Business Name */}
      <div>
        <label
          htmlFor="businessName"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Business Name (Optional)
        </label>
        <input
          id="businessName"
          type="text"
          value={settings.businessName}
          onChange={(e) =>
            setSettings({ ...settings, businessName: e.target.value })
          }
          placeholder="Legal business name for official documents"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          maxLength={100}
        />
        <p className="text-sm text-gray-500 mt-1">
          Official business name used for invoices and legal documents
        </p>
      </div>

      {/* Store Status */}
      <div>
        <label
          htmlFor="storeStatus"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Store Status
        </label>
        <div className="space-y-3">
          {[
            {
              value: "live",
              label: "Live",
              description: "Store is open and accepting orders",
            },
            {
              value: "maintenance",
              label: "Maintenance",
              description: "Store is temporarily closed for updates",
            },
            {
              value: "offline",
              label: "Offline",
              description: "Store is closed and not accepting orders",
            },
          ].map((option) => (
            <label
              key={option.value}
              className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                settings.storeStatus === option.value
                  ? getStatusColor(option.value)
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="storeStatus"
                value={option.value}
                checked={settings.storeStatus === option.value}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    storeStatus: e.target.value as any,
                  })
                }
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(option.value)}
                  <span className="font-medium">{option.label}</span>
                </div>
                <p className="text-sm mt-1 opacity-75">{option.description}</p>
              </div>
            </label>
          ))}
        </div>
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> New stores default to "Offline" status for
            security. Set your store to "Live" when you're ready to accept
            orders.
          </p>
        </div>
      </div>

      {/* Store Description */}
      <div>
        <label
          htmlFor="storeDescription"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Store Description
        </label>
        <textarea
          id="storeDescription"
          value={settings.storeDescription}
          onChange={(e) =>
            setSettings({ ...settings, storeDescription: e.target.value })
          }
          placeholder="Describe what your store specializes in..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          maxLength={500}
        />
        <p className="text-sm text-gray-500 mt-1">
          {500 - settings.storeDescription.length} characters remaining
        </p>
      </div>

      {/* Current Store Status Preview */}
      {settings.storeName && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Store Preview</h4>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {settings.storeName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h5 className="font-semibold text-gray-900">
                  {settings.storeName}
                </h5>
                <span
                  className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    settings.storeStatus
                  )}`}
                >
                  {getStatusIcon(settings.storeStatus)}
                  <span className="capitalize">{settings.storeStatus}</span>
                </span>
              </div>
              {settings.storeDescription && (
                <p className="text-sm text-gray-600 mt-1">
                  {settings.storeDescription}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex items-center justify-between pt-6">
        <div className="text-sm text-gray-500">
          {!settings.storeName.trim() && (
            <span className="text-red-500">
              ⚠️ Store name is required to save settings
            </span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={loadStoreSettings}
            disabled={saving}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving || !settings.storeName.trim()}
            className={`px-6 py-2 rounded-lg flex items-center space-x-2 transition-all ${
              !settings.storeName.trim()
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-primary text-white hover:bg-primary-dark"
            } disabled:opacity-50`}
            title={
              !settings.storeName.trim() ? "Please enter a store name" : ""
            }
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Settings</span>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
