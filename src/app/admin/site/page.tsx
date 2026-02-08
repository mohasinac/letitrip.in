"use client";

import { useState } from "react";
import { useApiQuery, useApiMutation } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { RichTextEditor, ImageUpload } from "@/components/admin";
import { Card, Button } from "@/components";

interface SiteSettings {
  id: string;
  companyName: string;
  companyDescription: string;
  companyAddress: string;
  supportEmail: string;
  supportPhone: string;
  websiteUrl: string;
  logoUrl: string;
  faviconUrl: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    keywords: string[];
    ogImage: string;
  };
  maintenance: {
    enabled: boolean;
    message: string;
  };
}

export default function AdminSitePage() {
  const { data, isLoading, error, refetch } = useApiQuery<{
    settings: SiteSettings;
  }>({
    queryKey: ["site", "settings"],
    queryFn: () => apiClient.get(API_ENDPOINTS.SITE_SETTINGS.GET),
  });

  const updateMutation = useApiMutation<any, any>({
    mutationFn: (data) =>
      apiClient.patch(API_ENDPOINTS.SITE_SETTINGS.UPDATE, data),
  });

  const [formData, setFormData] = useState<Partial<SiteSettings>>({});
  const [isSaving, setIsSaving] = useState(false);

  const settings = data?.settings;

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      await updateMutation.mutate(formData);
      await refetch();
      setFormData({});
      alert("Settings saved successfully!");
    } catch (err) {
      alert("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = <K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const currentSettings = { ...settings, ...formData };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  if (error || !settings) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">
            {error?.message || "Failed to load settings"}
          </p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Site Settings
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Configure your platform settings and information
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving || Object.keys(formData).length === 0}
          variant="primary"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Company Information */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Company Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={currentSettings.companyName || ""}
              onChange={(e) => updateField("companyName", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Description
            </label>
            <RichTextEditor
              content={currentSettings.companyDescription || ""}
              onChange={(content) => updateField("companyDescription", content)}
              placeholder="Enter company description..."
              minHeight="150px"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Address
            </label>
            <textarea
              value={currentSettings.companyAddress || ""}
              onChange={(e) => updateField("companyAddress", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Support Email
              </label>
              <input
                type="email"
                value={currentSettings.supportEmail || ""}
                onChange={(e) => updateField("supportEmail", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Support Phone
              </label>
              <input
                type="tel"
                value={currentSettings.supportPhone || ""}
                onChange={(e) => updateField("supportPhone", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Website URL
            </label>
            <input
              type="url"
              value={currentSettings.websiteUrl || ""}
              onChange={(e) => updateField("websiteUrl", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </Card>

      {/* Branding */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Branding
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageUpload
            currentImage={currentSettings.logoUrl}
            onUpload={(url) => updateField("logoUrl", url)}
            folder="site/branding"
            label="Logo"
            helperText="Recommended: 200x60px, PNG with transparent background"
          />

          <ImageUpload
            currentImage={currentSettings.faviconUrl}
            onUpload={(url) => updateField("faviconUrl", url)}
            folder="site/branding"
            label="Favicon"
            helperText="Recommended: 32x32px, ICO or PNG"
          />
        </div>
      </Card>

      {/* Social Links */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Social Media Links
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Facebook
            </label>
            <input
              type="url"
              value={currentSettings.socialLinks?.facebook || ""}
              onChange={(e) =>
                updateField("socialLinks", {
                  ...currentSettings.socialLinks,
                  facebook: e.target.value,
                })
              }
              placeholder="https://facebook.com/yourpage"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Twitter
            </label>
            <input
              type="url"
              value={currentSettings.socialLinks?.twitter || ""}
              onChange={(e) =>
                updateField("socialLinks", {
                  ...currentSettings.socialLinks,
                  twitter: e.target.value,
                })
              }
              placeholder="https://twitter.com/yourhandle"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Instagram
            </label>
            <input
              type="url"
              value={currentSettings.socialLinks?.instagram || ""}
              onChange={(e) =>
                updateField("socialLinks", {
                  ...currentSettings.socialLinks,
                  instagram: e.target.value,
                })
              }
              placeholder="https://instagram.com/yourprofile"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              LinkedIn
            </label>
            <input
              type="url"
              value={currentSettings.socialLinks?.linkedin || ""}
              onChange={(e) =>
                updateField("socialLinks", {
                  ...currentSettings.socialLinks,
                  linkedin: e.target.value,
                })
              }
              placeholder="https://linkedin.com/company/yourcompany"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </Card>

      {/* SEO */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          SEO Settings
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Meta Title
            </label>
            <input
              type="text"
              value={currentSettings.seo?.defaultTitle || ""}
              onChange={(e) =>
                updateField("seo", {
                  defaultTitle: e.target.value,
                  defaultDescription:
                    currentSettings.seo?.defaultDescription || "",
                  keywords: currentSettings.seo?.keywords || [],
                  ogImage: currentSettings.seo?.ogImage || "",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Meta Description
            </label>
            <textarea
              value={currentSettings.seo?.defaultDescription || ""}
              onChange={(e) =>
                updateField("seo", {
                  defaultTitle: currentSettings.seo?.defaultTitle || "",
                  defaultDescription: e.target.value,
                  keywords: currentSettings.seo?.keywords || [],
                  ogImage: currentSettings.seo?.ogImage || "",
                })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Meta Keywords (comma-separated)
            </label>
            <input
              type="text"
              value={currentSettings.seo?.keywords?.join(", ") || ""}
              onChange={(e) =>
                updateField("seo", {
                  defaultTitle: currentSettings.seo?.defaultTitle || "",
                  defaultDescription:
                    currentSettings.seo?.defaultDescription || "",
                  keywords: e.target.value
                    .split(",")
                    .map((k) => k.trim())
                    .filter(Boolean),
                  ogImage: currentSettings.seo?.ogImage || "",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </Card>

      {/* Maintenance Mode */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Maintenance Mode
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="maintenance-enabled"
              checked={currentSettings.maintenance?.enabled || false}
              onChange={(e) =>
                updateField("maintenance", {
                  enabled: e.target.checked,
                  message: currentSettings.maintenance?.message || "",
                })
              }
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="maintenance-enabled"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Enable Maintenance Mode
            </label>
          </div>

          {currentSettings.maintenance?.enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maintenance Message
              </label>
              <textarea
                value={currentSettings.maintenance?.message || ""}
                onChange={(e) =>
                  updateField("maintenance", {
                    enabled: currentSettings.maintenance?.enabled || false,
                    message: e.target.value,
                  })
                }
                rows={3}
                placeholder="We're performing scheduled maintenance. We'll be back soon!"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
