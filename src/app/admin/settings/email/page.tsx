"use client";

/**
 * Admin Email Settings Page
 *
 * Manage email service providers (Resend, SendGrid), templates, and preferences
 *
 * @status IMPLEMENTED
 * @task 1.5.3
 */

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { toast } from "@/components/admin/Toast";
import { FormField } from "@/components/forms/FormField";
import { FormInput } from "@/components/forms/FormInput";
import { FormSelect } from "@/components/forms/FormSelect";
import { useFormState } from "@/hooks/useFormState";
import { logError } from "@/lib/firebase-error-logger";
import { Check, Mail, Send } from "lucide-react";
import { useEffect, useState } from "react";

interface EmailSettings {
  defaultProvider: "resend" | "sendgrid";
  // Resend Settings
  resendEnabled: boolean;
  resendApiKey: string;
  resendFromEmail: string;
  resendFromName: string;
  // SendGrid Settings
  sendgridEnabled: boolean;
  sendgridApiKey: string;
  sendgridFromEmail: string;
  sendgridFromName: string;
  // General Settings
  fallbackEnabled: boolean;
  retryAttempts: number;
  retryDelay: number;
  // Category Settings
  categories: {
    TRANSACTIONAL: { enabled: boolean; provider?: "resend" | "sendgrid" };
    MARKETING: { enabled: boolean; provider?: "resend" | "sendgrid" };
    NOTIFICATIONS: { enabled: boolean; provider?: "resend" | "sendgrid" };
    ACCOUNT: { enabled: boolean; provider?: "resend" | "sendgrid" };
  };
}

const defaultSettings: EmailSettings = {
  defaultProvider: "resend",
  resendEnabled: false,
  resendApiKey: "",
  resendFromEmail: "",
  resendFromName: "JustForView.in",
  sendgridEnabled: false,
  sendgridApiKey: "",
  sendgridFromEmail: "",
  sendgridFromName: "JustForView.in",
  fallbackEnabled: true,
  retryAttempts: 3,
  retryDelay: 5000,
  categories: {
    TRANSACTIONAL: { enabled: true, provider: "resend" },
    MARKETING: { enabled: true, provider: "resend" },
    NOTIFICATIONS: { enabled: true, provider: "resend" },
    ACCOUNT: { enabled: true, provider: "resend" },
  },
};

interface EmailFormState {
  loading: boolean;
  saving: boolean;
  testing: "resend" | "sendgrid" | null;
}

export default function EmailSettingsPage() {
  const [settings, setSettings] = useState<EmailSettings>(defaultSettings);
  const { formData: formState, setFieldValue: setFormState } =
    useFormState<EmailFormState>({
      initialData: {
        loading: true,
        saving: false,
        testing: null,
      },
    });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setFormState("loading", true);
      const response = await fetch("/api/admin/settings/email");
      if (!response.ok) throw new Error("Failed to load settings");
      const data = await response.json();
      setSettings(data || defaultSettings);
    } catch (error) {
      logError(error as Error, {
        component: "EmailSettingsPage.loadSettings",
      });
      toast.error("Failed to load email settings");
    } finally {
      setFormState("loading", false);
    }
  };

  const handleSave = async () => {
    try {
      setFormState("saving", true);

      const response = await fetch("/api/admin/settings/email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error("Failed to save settings");

      toast.success("Email settings saved successfully");
    } catch (error) {
      logError(error as Error, {
        component: "EmailSettingsPage.handleSave",
      });
      toast.error("Failed to save email settings");
    } finally {
      setFormState("saving", false);
    }
  };

  const handleTestConnection = async (provider: "resend" | "sendgrid") => {
    try {
      setFormState("testing", provider);

      const response = await fetch("/api/admin/settings/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });

      if (!response.ok) throw new Error("Connection test failed");

      const data = await response.json();

      if (data.success) {
        toast.success(
          `${
            provider === "resend" ? "Resend" : "SendGrid"
          } connection successful!`
        );
      } else {
        toast.error(
          `${provider === "resend" ? "Resend" : "SendGrid"} connection failed`
        );
      }
    } catch (error) {
      logError(error as Error, {
        component: "EmailSettingsPage.handleTestConnection",
        provider,
      });
      toast.error(
        `Failed to test ${
          provider === "resend" ? "Resend" : "SendGrid"
        } connection`
      );
    } finally {
      setFormState("testing", null);
    }
  };

  if (formState.loading) {
    return (
      <div className="p-6">
        <AdminPageHeader
          title="Email Settings"
          description="Configure email service providers and preferences"
        />
        <div className="mt-6 flex items-center justify-center">
          <div className="text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <AdminPageHeader
        title="Email Settings"
        description="Configure email service providers and preferences"
      />

      <div className="mt-6 space-y-6">
        {/* General Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            General Settings
          </h2>

          <div className="space-y-4">
            <FormField label="Default Provider" required>
              <FormSelect
                value={settings.defaultProvider}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultProvider: e.target.value as "resend" | "sendgrid",
                  })
                }
                options={[
                  { value: "resend", label: "Resend" },
                  { value: "sendgrid", label: "SendGrid" },
                ]}
              />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Retry Attempts" required>
                <FormInput
                  type="number"
                  min="0"
                  max="10"
                  value={settings.retryAttempts}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      retryAttempts: parseInt(e.target.value),
                    })
                  }
                />
              </FormField>

              <FormField label="Retry Delay (ms)" required>
                <FormInput
                  type="number"
                  min="1000"
                  max="60000"
                  step="1000"
                  value={settings.retryDelay}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      retryDelay: parseInt(e.target.value),
                    })
                  }
                />
              </FormField>

              <div className="flex items-center pt-6">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.fallbackEnabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        fallbackEnabled: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                    Enable Fallback
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Resend Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Resend Configuration
              </h2>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.resendEnabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    resendEnabled: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                {settings.resendEnabled ? "Enabled" : "Disabled"}
              </span>
            </label>
          </div>

          {settings.resendEnabled && (
            <div className="space-y-4">
              <FormField label="API Key" required>
                <FormInput
                  type="password"
                  value={settings.resendApiKey}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      resendApiKey: e.target.value,
                    })
                  }
                  placeholder="re_..."
                />
              </FormField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="From Email" required>
                  <FormInput
                    type="email"
                    value={settings.resendFromEmail}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        resendFromEmail: e.target.value,
                      })
                    }
                    placeholder="noreply@justforview.in"
                  />
                </FormField>

                <FormField label="From Name" required>
                  <FormInput
                    type="text"
                    value={settings.resendFromName}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        resendFromName: e.target.value,
                      })
                    }
                    placeholder="JustForView.in"
                  />
                </FormField>
              </div>

              <button
                type="button"
                onClick={() => handleTestConnection("resend")}
                disabled={formState.testing === "resend"}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {formState.testing === "resend" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Test Connection
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* SendGrid Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                SendGrid Configuration
              </h2>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.sendgridEnabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    sendgridEnabled: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                {settings.sendgridEnabled ? "Enabled" : "Disabled"}
              </span>
            </label>
          </div>

          {settings.sendgridEnabled && (
            <div className="space-y-4">
              <FormField label="API Key" required>
                <FormInput
                  type="password"
                  value={settings.sendgridApiKey}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      sendgridApiKey: e.target.value,
                    })
                  }
                  placeholder="SG...."
                />
              </FormField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="From Email" required>
                  <FormInput
                    type="email"
                    value={settings.sendgridFromEmail}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        sendgridFromEmail: e.target.value,
                      })
                    }
                    placeholder="noreply@justforview.in"
                  />
                </FormField>

                <FormField label="From Name" required>
                  <FormInput
                    type="text"
                    value={settings.sendgridFromName}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        sendgridFromName: e.target.value,
                      })
                    }
                    placeholder="JustForView.in"
                  />
                </FormField>
              </div>

              <button
                type="button"
                onClick={() => handleTestConnection("sendgrid")}
                disabled={formState.testing === "sendgrid"}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {formState.testing === "sendgrid" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Test Connection
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Email Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Email Categories
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Configure which provider to use for each email category
          </p>

          <div className="space-y-4">
            {Object.entries(settings.categories).map(([category, config]) => (
              <div
                key={category}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.enabled}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          categories: {
                            ...settings.categories,
                            [category]: {
                              ...config,
                              enabled: e.target.checked,
                            },
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {category}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {category === "TRANSACTIONAL" &&
                        "Order confirmations, receipts (Required)"}
                      {category === "MARKETING" && "Promotions, newsletters"}
                      {category === "NOTIFICATIONS" &&
                        "Auction updates, product alerts"}
                      {category === "ACCOUNT" &&
                        "Security, password resets (Required)"}
                    </div>
                  </div>
                </div>

                {config.enabled && (
                  <FormSelect
                    value={config.provider || settings.defaultProvider}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        categories: {
                          ...settings.categories,
                          [category]: {
                            ...config,
                            provider: e.target.value as "resend" | "sendgrid",
                          },
                        },
                      })
                    }
                    options={[
                      { value: "resend", label: "Resend" },
                      { value: "sendgrid", label: "SendGrid" },
                    ]}
                    className="w-full sm:w-40"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={loadSettings}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={formState.saving}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
          >
            {formState.saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
