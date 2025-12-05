"use client";

/**
 * WhatsApp Settings Page
 *
 * @status IMPLEMENTED
 * @task 1.4.3
 *
 * Admin interface for WhatsApp Business API configuration
 */

import { FormField } from "@/components/forms/FormField";
import { FormInput } from "@/components/forms/FormInput";
import { FormLabel } from "@/components/forms/FormLabel";
import { TEMPLATES, WHATSAPP_PROVIDERS } from "@/config/whatsapp.config";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import { apiService } from "@/services/api.service";
import {
  CheckCircle,
  MessageSquare,
  RefreshCcw,
  Save,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface WhatsAppSettings {
  twilioEnabled: boolean;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
  gupshupEnabled: boolean;
  gupshupApiKey?: string;
  gupshupAppName?: string;
  gupshupPhoneNumber?: string;
  defaultProvider: "twilio" | "gupshup";
  enableMarketingMessages: boolean;
  enableUtilityMessages: boolean;
  enableAuthMessages: boolean;
  enableServiceMessages: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function WhatsAppSettingsPage() {
  const [settings, setSettings] = useState<WhatsAppSettings>({
    twilioEnabled: false,
    gupshupEnabled: false,
    defaultProvider: "twilio",
    enableMarketingMessages: true,
    enableUtilityMessages: true,
    enableAuthMessages: true,
    enableServiceMessages: true,
  });

  const [connectionStatus, setConnectionStatus] = useState<{
    twilio: "unknown" | "online" | "offline" | "testing";
    gupshup: "unknown" | "online" | "offline" | "testing";
  }>({
    twilio: "unknown",
    gupshup: "unknown",
  });

  const { execute: saveSettings, isLoading: saving } = useLoadingState();
  const { execute: testConnection, isLoading: testing } = useLoadingState();
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await apiService.get<WhatsAppSettings>(
        "/admin/settings/whatsapp"
      );
      if (response) {
        setSettings(response);
      }
    } catch (error) {
      logError(error as Error, {
        component: "WhatsAppSettingsPage.loadSettings",
      });
    }
  };

  const handleSave = async () => {
    await saveSettings(async () => {
      await apiService.put("/admin/settings/whatsapp", settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    });
  };

  const handleTestConnection = async (provider: "twilio" | "gupshup") => {
    setConnectionStatus((prev) => ({ ...prev, [provider]: "testing" }));

    await testConnection(async () => {
      try {
        const response = await apiService.post<{ status: string }>(
          `/admin/settings/whatsapp/test/${provider}`,
          {}
        );

        setConnectionStatus((prev) => ({
          ...prev,
          [provider]: response?.status === "ok" ? "online" : "offline",
        }));
      } catch (error) {
        setConnectionStatus((prev) => ({ ...prev, [provider]: "offline" }));
      }
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "offline":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "testing":
        return <RefreshCcw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <MessageSquare className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            WhatsApp Settings
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure WhatsApp Business API for automated notifications
          </p>
        </div>

        {/* Twilio Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-blue-500" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Twilio (Primary)
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Priority {WHATSAPP_PROVIDERS.TWILIO.priority} • Rich media
                  support
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusIcon(connectionStatus.twilio)}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.twilioEnabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      twilioEnabled: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {settings.twilioEnabled && (
            <div className="space-y-4">
              <FormField label="Account SID" required>
                <FormInput
                  type="password"
                  value={settings.twilioAccountSid || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      twilioAccountSid: e.target.value,
                    })
                  }
                  placeholder="AC..."
                />
              </FormField>

              <FormField label="Auth Token" required>
                <FormInput
                  type="password"
                  value={settings.twilioAuthToken || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      twilioAuthToken: e.target.value,
                    })
                  }
                  placeholder="Enter auth token"
                />
              </FormField>

              <FormField label="WhatsApp Phone Number" required>
                <div>
                  <FormInput
                    type="tel"
                    value={settings.twilioPhoneNumber || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        twilioPhoneNumber: e.target.value,
                      })
                    }
                    placeholder="+14155238886"
                  />
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    Format: +[country_code][phone_number]
                  </p>
                </div>
              </FormField>

              <button
                onClick={() => handleTestConnection("twilio")}
                disabled={testing || connectionStatus.twilio === "testing"}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <RefreshCcw
                  className={`h-4 w-4 ${
                    connectionStatus.twilio === "testing" ? "animate-spin" : ""
                  }`}
                />
                Test Connection
              </button>
            </div>
          )}
        </div>

        {/* Gupshup Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-purple-500" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Gupshup (Fallback)
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Priority {WHATSAPP_PROVIDERS.GUPSHUP.priority} • High volume
                  support
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusIcon(connectionStatus.gupshup)}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.gupshupEnabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      gupshupEnabled: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {settings.gupshupEnabled && (
            <div className="space-y-4">
              <FormField label="API Key" required>
                <FormInput
                  type="password"
                  value={settings.gupshupApiKey || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, gupshupApiKey: e.target.value })
                  }
                  placeholder="Enter API key"
                />
              </FormField>

              <FormField label="App Name" required>
                <FormInput
                  value={settings.gupshupAppName || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, gupshupAppName: e.target.value })
                  }
                  placeholder="Enter app name"
                />
              </FormField>

              <FormField label="WhatsApp Phone Number" required>
                <FormInput
                  type="tel"
                  value={settings.gupshupPhoneNumber || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      gupshupPhoneNumber: e.target.value,
                    })
                  }
                  placeholder="+919876543210"
                />
              </FormField>

              <button
                onClick={() => handleTestConnection("gupshup")}
                disabled={testing || connectionStatus.gupshup === "testing"}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <RefreshCcw
                  className={`h-4 w-4 ${
                    connectionStatus.gupshup === "testing" ? "animate-spin" : ""
                  }`}
                />
                Test Connection
              </button>
            </div>
          )}
        </div>

        {/* Message Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Message Categories
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <FormLabel>Marketing Messages</FormLabel>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Offers, promotions, price drops
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableMarketingMessages}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      enableMarketingMessages: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <FormLabel>Utility Messages</FormLabel>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Order updates, shipping, account changes
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableUtilityMessages}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      enableUtilityMessages: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <FormLabel>Authentication Messages</FormLabel>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  OTP, verification codes
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableAuthMessages}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      enableAuthMessages: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <FormLabel>Service Messages</FormLabel>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Customer support, returns, refunds
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableServiceMessages}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      enableServiceMessages: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Available Templates */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Available Templates ({Object.keys(TEMPLATES).length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(TEMPLATES).map(([key, template]) => (
              <div
                key={key}
                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {template.name}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {template.category}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {template.components
                    .find((c) => c.type === "body")
                    ?.text?.slice(0, 80)}
                  ...
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          {saveSuccess && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">
                Settings saved successfully
              </span>
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="ml-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
