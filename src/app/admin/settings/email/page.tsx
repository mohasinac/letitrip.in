"use client";

/**
 * Admin Email Settings Page
 *
 * @status IMPLEMENTED
 * @epic E021 - System Configuration
 *
 * Manage email configuration:
 * - Resend API settings
 * - Email templates
 * - Sender information
 */

import { FormInput, FormLabel } from "@/components/forms";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import { apiService } from "@/services/api.service";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Mail,
  Save,
  Send,
  Settings,
  TestTube,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface EmailSettings {
  provider: "resend";
  fromEmail: string;
  fromName: string;
  replyToEmail: string;
  apiKey?: string;
  templates: {
    orderConfirmation: boolean;
    shippingUpdate: boolean;
    deliveryConfirmation: boolean;
    returnRequest: boolean;
    refundProcessed: boolean;
    welcomeEmail: boolean;
    passwordReset: boolean;
    newsletter: boolean;
  };
}

const DEFAULT_SETTINGS: EmailSettings = {
  provider: "resend",
  fromEmail: "noreply@letitrip.in",
  fromName: "Letitrip",
  replyToEmail: "support@letitrip.in",
  templates: {
    orderConfirmation: true,
    shippingUpdate: true,
    deliveryConfirmation: true,
    returnRequest: true,
    refundProcessed: true,
    welcomeEmail: true,
    passwordReset: true,
    newsletter: false,
  },
};

export default function AdminEmailSettingsPage() {
  const {
    isLoading: loading,
    error,
    data: settings,
    setData: setSettings,
    execute,
  } = useLoadingState<EmailSettings>({
    initialData: DEFAULT_SETTINGS,
    onLoadError: (error) => {
      logError(error, { component: "AdminEmailSettingsPage.loadSettings" });
    },
  });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [activeTab, setActiveTab] = useState<"provider" | "templates">(
    "provider",
  );

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () =>
    execute(async () => {
      const response = await apiService.get<{ settings: EmailSettings }>(
        "/api/admin/settings?category=email",
      );
      if (response.settings) {
        return { ...DEFAULT_SETTINGS, ...response.settings };
      }
      return DEFAULT_SETTINGS;
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setFormError(null);
      setSuccess(null);
      await apiService.put("/api/admin/settings", {
        category: "email",
        settings,
      });
      setSuccess("Email settings saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setFormError(
        err instanceof Error ? err.message : "Failed to save settings",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      setFormError("Please enter a test email address");
      return;
    }

    try {
      setTesting(true);
      setFormError(null);
      await apiService.post("/api/admin/email/test", { to: testEmail });
      setSuccess("Test email sent successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error sending test email:", err);
      setFormError(
        err instanceof Error ? err.message : "Failed to send test email",
      );
    } finally {
      setTesting(false);
    }
  };

  const templateLabels: Record<
    keyof EmailSettings["templates"],
    { label: string; description: string }
  > = {
    orderConfirmation: {
      label: "Order Confirmation",
      description: "Sent when order is placed",
    },
    shippingUpdate: {
      label: "Shipping Updates",
      description: "Sent when order ships",
    },
    deliveryConfirmation: {
      label: "Delivery Confirmation",
      description: "Sent when order is delivered",
    },
    returnRequest: {
      label: "Return Request",
      description: "Sent when return is requested",
    },
    refundProcessed: {
      label: "Refund Processed",
      description: "Sent when refund is completed",
    },
    welcomeEmail: { label: "Welcome Email", description: "Sent to new users" },
    passwordReset: {
      label: "Password Reset",
      description: "Sent for password recovery",
    },
    newsletter: {
      label: "Newsletter",
      description: "Marketing and promotional emails",
    },
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6" />
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

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
            <span>Email</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Mail className="w-6 h-6" />
            Email Settings
          </h1>
        </div>
        <Link
          href="/admin/settings"
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </Link>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 dark:text-red-200">
            {error instanceof Error ? error.message : String(error)}
          </p>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <p className="text-green-800 dark:text-green-200">{success}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("provider")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === "provider"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <Settings className="w-4 h-4" />
          Provider Settings
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === "templates"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <FileText className="w-4 h-4" />
          Email Templates
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {activeTab === "provider" && (
          <>
            {/* Provider Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Email Provider
              </h2>
              <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center gap-3">
                  <Mail className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Resend
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Modern email API with excellent deliverability
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sender Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Sender Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <FormInput
                  label="From Email"
                  type="email"
                  value={settings.fromEmail}
                  onChange={(e) =>
                    setSettings({ ...settings, fromEmail: e.target.value })
                  }
                  placeholder="noreply@example.com"
                />
                <FormInput
                  label="From Name"
                  value={settings.fromName}
                  onChange={(e) =>
                    setSettings({ ...settings, fromName: e.target.value })
                  }
                  placeholder="Your Store Name"
                />
                <div className="md:col-span-2">
                  <FormInput
                    label="Reply-To Email"
                    type="email"
                    value={settings.replyToEmail}
                    onChange={(e) =>
                      setSettings({ ...settings, replyToEmail: e.target.value })
                    }
                    placeholder="support@example.com"
                  />
                </div>
              </div>
            </div>

            {/* API Configuration */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Resend API Configuration
              </h2>
              <div>
                <FormLabel htmlFor="api-key">API Key</FormLabel>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={settings.apiKey || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, apiKey: e.target.value })
                    }
                    placeholder="re_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Get your API key from{" "}
                  <a
                    href="https://resend.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Resend Dashboard
                  </a>
                </p>
              </div>
            </div>

            {/* Test Email */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TestTube className="w-5 h-5 text-purple-500" />
                Test Configuration
              </h2>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Enter email to send test"
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleTestEmail}
                  disabled={testing || !testEmail}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {testing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send Test
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === "templates" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Email Templates
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Enable or disable automatic email notifications
            </p>
            <div className="space-y-4">
              {(
                Object.keys(settings.templates) as Array<
                  keyof EmailSettings["templates"]
                >
              ).map((template) => (
                <label
                  key={template}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {templateLabels[template].label}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {templateLabels[template].description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        templates: {
                          ...settings.templates,
                          [template]: !settings.templates[template],
                        },
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.templates[template]
                        ? "bg-blue-600"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.templates[template]
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
