"use client";

/**
 * Admin General Settings Page
 *
 * @status IMPLEMENTED
 * @epic E021 - System Configuration
 *
 * Manage general site settings including:
 * - Site name, tagline, description
 * - Contact information
 * - Logo and favicon
 * - Social media links
 * - Maintenance mode
 */

import { logError } from "@/lib/firebase-error-logger";
import {
  settingsService,
  type GeneralSettings,
} from "@/services/settings.service";
import {
  FormInput,
  FormLabel,
  FormTextarea,
  useFormState,
  useLoadingState,
} from "@letitrip/react-library";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminGeneralSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "basic" | "contact" | "social" | "maintenance"
  >("basic");

  const {
    isLoading: loading,
    error,
    data: settings,
    setData: setSettings,
    execute,
  } = useLoadingState<GeneralSettings | null>({
    initialData: null,
    onLoadError: (err) => {
      logError(err, {
        component: "AdminGeneralSettings.loadSettings",
      });
    },
  });

  const { formData: saveStatus, setFieldValue: setSaveStatus } = useFormState<{
    saving: boolean;
    formError: string | null;
    success: string | null;
  }>({
    initialData: {
      saving: false,
      formError: null,
      success: null,
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    await execute(async () => {
      const data = await settingsService.getGeneral();
      return data;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      setSaveStatus("saving", true);
      setSaveStatus("formError", null);
      setSaveStatus("success", null);
      await settingsService.updateGeneral(settings);
      setSaveStatus("success", "Settings saved successfully!");
      setTimeout(() => setSaveStatus("success", null), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setSaveStatus(
        "formError",
        err instanceof Error ? err.message : "Failed to save settings"
      );
    } finally {
      setSaveStatus("saving", false);
    }
  };

  const updateField = <K extends keyof GeneralSettings>(
    field: K,
    value: GeneralSettings[K]
  ) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const updateSocialLink = (
    platform: keyof GeneralSettings["socialLinks"],
    value: string
  ) => {
    if (!settings) return;
    setSettings({
      ...settings,
      socialLinks: {
        ...settings.socialLinks,
        [platform]: value,
      },
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6" />
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            {error instanceof Error
              ? error.message
              : error || "Failed to load settings"}
          </p>
          <button
            onClick={loadSettings}
            className="mt-2 text-sm text-red-600 dark:text-red-400 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "basic" as const, label: "Basic Info", icon: "📝" },
    { id: "contact" as const, label: "Contact", icon: "📞" },
    { id: "social" as const, label: "Social Links", icon: "🔗" },
    { id: "maintenance" as const, label: "Maintenance", icon: "🔧" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <Link
              href="/admin"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              Admin
            </Link>
            <span>/</span>
            <Link
              href="/admin/settings"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              Settings
            </Link>
            <span>/</span>
            <span>General</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            General Settings
          </h1>
        </div>
        <button
          onClick={() => router.push("/admin/settings")}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          ← Back to Settings
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            {error instanceof Error ? error.message : String(error)}
          </p>
        </div>
      )}

      {saveStatus.success && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-800 dark:text-green-200">
            {saveStatus.success}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        {/* Basic Info Tab */}
        {activeTab === "basic" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Basic Information
            </h2>

            <FormInput
              label="Site Name"
              value={settings.siteName}
              onChange={(e) => updateField("siteName", e.target.value)}
              required
            />

            <FormInput
              label="Tagline"
              value={settings.siteTagline}
              onChange={(e) => updateField("siteTagline", e.target.value)}
              placeholder="A short catchy tagline"
            />

            <FormTextarea
              label="Site Description"
              value={settings.siteDescription}
              onChange={(e) => updateField("siteDescription", e.target.value)}
              rows={3}
              placeholder="Brief description for SEO and meta tags"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Logo URL"
                type="url"
                value={settings.logoUrl}
                onChange={(e) => updateField("logoUrl", e.target.value)}
                placeholder="https://example.com/logo.png"
              />

              <FormInput
                label="Favicon URL"
                type="url"
                value={settings.faviconUrl}
                onChange={(e) => updateField("faviconUrl", e.target.value)}
                placeholder="https://example.com/favicon.ico"
              />
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === "contact" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Contact Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Contact Email"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => updateField("contactEmail", e.target.value)}
                required
              />

              <FormInput
                label="Support Email"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => updateField("supportEmail", e.target.value)}
              />
            </div>

            <FormInput
              label="Phone Number"
              type="tel"
              value={settings.contactPhone}
              onChange={(e) => updateField("contactPhone", e.target.value)}
              placeholder="+91 98765 43210"
            />

            <FormTextarea
              label="Business Address"
              value={settings.address}
              onChange={(e) => updateField("address", e.target.value)}
              rows={3}
              placeholder="Enter your business address"
            />
          </div>
        )}

        {/* Social Links Tab */}
        {activeTab === "social" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Social Media Links
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="📘 Facebook"
                type="url"
                value={settings.socialLinks.facebook}
                onChange={(e) => updateSocialLink("facebook", e.target.value)}
                placeholder="https://facebook.com/yourpage"
              />

              <FormInput
                label="🐦 Twitter/X"
                type="url"
                value={settings.socialLinks.twitter}
                onChange={(e) => updateSocialLink("twitter", e.target.value)}
                placeholder="https://twitter.com/yourhandle"
              />

              <FormInput
                label="📸 Instagram"
                type="url"
                value={settings.socialLinks.instagram}
                onChange={(e) => updateSocialLink("instagram", e.target.value)}
                placeholder="https://instagram.com/yourprofile"
              />

              <FormInput
                label="💼 LinkedIn"
                type="url"
                value={settings.socialLinks.linkedin}
                onChange={(e) => updateSocialLink("linkedin", e.target.value)}
                placeholder="https://linkedin.com/company/yourcompany"
              />

              <div className="md:col-span-2">
                <FormInput
                  label="🎬 YouTube"
                  type="url"
                  value={settings.socialLinks.youtube}
                  onChange={(e) => updateSocialLink("youtube", e.target.value)}
                  placeholder="https://youtube.com/@yourchannel"
                />
              </div>
            </div>
          </div>
        )}

        {/* Maintenance Tab */}
        {activeTab === "maintenance" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Maintenance Mode
            </h2>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Warning:</strong> Enabling maintenance mode will prevent
                all non-admin users from accessing the site.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) =>
                    updateField("maintenanceMode", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600" />
              </label>
              <span className="text-gray-700 dark:text-gray-300">
                {settings.maintenanceMode ? (
                  <span className="text-red-600 dark:text-red-400 font-semibold">
                    Maintenance Mode is ON
                  </span>
                ) : (
                  "Maintenance Mode is OFF"
                )}
              </span>
            </div>

            <div>
              <FormLabel htmlFor="maintenance-message">
                Maintenance Message
              </FormLabel>
              <textarea
                value={settings.maintenanceMessage}
                onChange={(e) =>
                  updateField("maintenanceMessage", e.target.value)
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Message to display when site is under maintenance"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                This message will be shown to visitors when maintenance mode is
                enabled.
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push("/admin/settings")}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saveStatus.saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {saveStatus.saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
