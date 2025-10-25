"use client";

import { useState, useEffect } from "react";
import {
  CogIcon,
  CreditCardIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  phoneNumber: string;
  address: string;
  isLive: boolean;
  maintenanceMessage: string;
  currency: string;
  taxRate: number;
  shippingCost: number;
  paymentSettings: {
    stripeEnabled: boolean;
    paypalEnabled: boolean;
    codEnabled: boolean;
    stripePublicKey: string;
    paypalClientId: string;
  };
}

export default function AdminGeneralSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/settings");

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else if (response.status === 404) {
        const data = await response.json();
        if (data.siteName) {
          setSettings(data);
        } else {
          console.warn("Settings not found, using defaults");
          setSettings(null);
        }
      } else {
        console.error("Failed to fetch settings:", response.status);
        setSettings(null);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      setSettings(null);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert("Settings saved successfully!");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (path: string, value: any) => {
    if (!settings) return;

    const keys = path.split(".");
    const newSettings = { ...settings };
    let current: any = newSettings;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setSettings(newSettings);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold text-primary mb-2">
          Settings Not Available
        </h2>
        <p className="text-muted mb-4">
          Failed to load settings. Please try refreshing the page.
        </p>
        <button onClick={fetchSettings} className="btn btn-danger">
          Retry Loading Settings
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-primary">General Settings</h3>
          <p className="text-secondary">
            Configure your basic site settings and information.
          </p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <ShieldCheckIcon className="h-5 w-5" />
          )}
          <span>{saving ? "Saving..." : "Save Settings"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Site Name
          </label>
          <input
            type="text"
            value={settings.siteName || ""}
            onChange={(e) => updateSettings("siteName", e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Contact Email
          </label>
          <input
            type="email"
            value={settings.contactEmail || ""}
            onChange={(e) => updateSettings("contactEmail", e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={settings.phoneNumber || ""}
            onChange={(e) => updateSettings("phoneNumber", e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Currency
          </label>
          <select
            value={settings.currency || "INR"}
            onChange={(e) => updateSettings("currency", e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="INR">INR (₹)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary mb-2">
          Site Description
        </label>
        <textarea
          value={settings.siteDescription || ""}
          onChange={(e) => updateSettings("siteDescription", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary mb-2">
          Address
        </label>
        <textarea
          value={settings.address || ""}
          onChange={(e) => updateSettings("address", e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
        />
      </div>

      <div className="border-t pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-primary">Site Status</h4>
            <p className="text-sm text-muted">
              Control whether your site is live or in maintenance mode
            </p>
          </div>
          <button
            onClick={() => updateSettings("isLive", !(settings.isLive ?? true))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.isLive ?? true ? "bg-green-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.isLive ?? true ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {!(settings.isLive ?? true) && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-secondary mb-2">
              Maintenance Message
            </label>
            <textarea
              value={settings.maintenanceMessage || ""}
              onChange={(e) =>
                updateSettings("maintenanceMessage", e.target.value)
              }
              rows={2}
              className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="We're currently performing scheduled maintenance. Please check back soon!"
            />
          </div>
        )}
      </div>
    </div>
  );
}
