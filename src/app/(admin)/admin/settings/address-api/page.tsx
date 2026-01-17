"use client";

/**
 * Address API Settings Page
 *
 * @status IMPLEMENTED
 * @task 1.2.4
 *
 * Admin interface for configuring address lookup APIs:
 * - Postal Pincode API (India)
 * - Zippopotam API (International)
 * - Rate limit monitoring
 * - Test connections
 */

import { FormField } from "@letitrip/react-library";
import { FormInput } from "@letitrip/react-library";
import { FormLabel } from "@letitrip/react-library";
import { FormSelect } from "@letitrip/react-library";
import { useLoadingState } from "@letitrip/react-library";
import { logError } from "@/lib/firebase-error-logger";
import { apiService } from "@/services/api.service";
import {
  AlertCircle,
  CheckCircle,
  Globe,
  MapPin,
  RefreshCcw,
  Save,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface AddressAPISettings {
  postalPincodeEnabled: boolean;
  postalPincodeApiKey?: string;
  zippopotamEnabled: boolean;
  fallbackEnabled: boolean;
  cacheEnabled: boolean;
  cacheTime: number;
}

interface APIStatus {
  name: string;
  status: "online" | "offline" | "testing" | "unknown";
  responseTime?: number;
  lastChecked?: Date;
  rateLimitUsed?: number;
  rateLimitTotal?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function AddressAPISettingsPage() {
  const [settings, setSettings] = useState<AddressAPISettings>({
    postalPincodeEnabled: true,
    zippopotamEnabled: true,
    fallbackEnabled: true,
    cacheEnabled: true,
    cacheTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  const [apiStatuses, setApiStatuses] = useState<APIStatus[]>([
    {
      name: "Postal Pincode API",
      status: "unknown",
    },
    {
      name: "Zippopotam API",
      status: "unknown",
    },
  ]);

  const { execute: saveSettings, isLoading: saving } = useLoadingState();
  const { execute: testAPI, isLoading: testing } = useLoadingState();
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
    checkAPIStatuses();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await apiService.get<AddressAPISettings>(
        "/admin/settings/address-api"
      );
      if (response) {
        setSettings(response);
      }
    } catch (error) {
      logError(error as Error, {
        component: "AddressAPISettingsPage.loadSettings",
      });
    }
  };

  const checkAPIStatuses = async () => {
    // Check Postal Pincode API
    try {
      const start = Date.now();
      const response = await apiService.get<{ status: string }>(
        "/address/api-status/postal-pincode"
      );
      const responseTime = Date.now() - start;

      setApiStatuses((prev) =>
        prev.map((api) =>
          api.name === "Postal Pincode API"
            ? {
                ...api,
                status: response?.status === "ok" ? "online" : "offline",
                responseTime,
                lastChecked: new Date(),
              }
            : api
        )
      );
    } catch (error) {
      setApiStatuses((prev) =>
        prev.map((api) =>
          api.name === "Postal Pincode API"
            ? { ...api, status: "offline", lastChecked: new Date() }
            : api
        )
      );
    }

    // Check Zippopotam API
    try {
      const start = Date.now();
      const response = await apiService.get<{ status: string }>(
        "/address/api-status/zippopotam"
      );
      const responseTime = Date.now() - start;

      setApiStatuses((prev) =>
        prev.map((api) =>
          api.name === "Zippopotam API"
            ? {
                ...api,
                status: response?.status === "ok" ? "online" : "offline",
                responseTime,
                lastChecked: new Date(),
              }
            : api
        )
      );
    } catch (error) {
      setApiStatuses((prev) =>
        prev.map((api) =>
          api.name === "Zippopotam API"
            ? { ...api, status: "offline", lastChecked: new Date() }
            : api
        )
      );
    }
  };

  const handleSave = async () => {
    await saveSettings(async () => {
      await apiService.put("/admin/settings/address-api", settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    });
  };

  const handleTestAPI = async (apiName: string) => {
    setApiStatuses((prev) =>
      prev.map((api) =>
        api.name === apiName ? { ...api, status: "testing" } : api
      )
    );

    await testAPI(async () => {
      if (apiName === "Postal Pincode API") {
        // Test with a sample PIN code
        const start = Date.now();
        const response = await apiService.get("/address/pincode/110001");
        const responseTime = Date.now() - start;

        setApiStatuses((prev) =>
          prev.map((api) =>
            api.name === apiName
              ? {
                  ...api,
                  status: response ? "online" : "offline",
                  responseTime,
                  lastChecked: new Date(),
                }
              : api
          )
        );
      } else if (apiName === "Zippopotam API") {
        // Test with a sample postal code
        const start = Date.now();
        const response = await apiService.get("/address/postal-code/US/90210");
        const responseTime = Date.now() - start;

        setApiStatuses((prev) =>
          prev.map((api) =>
            api.name === apiName
              ? {
                  ...api,
                  status: response ? "online" : "offline",
                  responseTime,
                  lastChecked: new Date(),
                }
              : api
          )
        );
      }
    });
  };

  const getStatusIcon = (status: APIStatus["status"]) => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "offline":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "testing":
        return <RefreshCcw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: APIStatus["status"]) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium";
    switch (status) {
      case "online":
        return (
          <span
            className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}
          >
            Online
          </span>
        );
      case "offline":
        return (
          <span
            className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`}
          >
            Offline
          </span>
        );
      case "testing":
        return (
          <span
            className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`}
          >
            Testing...
          </span>
        );
      default:
        return (
          <span
            className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`}
          >
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Address API Settings
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure address lookup APIs for PIN code and postal code
            validation
          </p>
        </div>

        {/* API Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {apiStatuses.map((api) => (
            <div
              key={api.name}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {api.name === "Postal Pincode API" ? (
                    <MapPin className="h-6 w-6 text-blue-500" />
                  ) : (
                    <Globe className="h-6 w-6 text-purple-500" />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {api.name}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {api.name === "Postal Pincode API"
                        ? "India PIN code lookup"
                        : "International postal codes"}
                    </p>
                  </div>
                </div>
                {getStatusIcon(api.status)}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Status
                  </span>
                  {getStatusBadge(api.status)}
                </div>

                {api.responseTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Response Time
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {api.responseTime}ms
                    </span>
                  </div>
                )}

                {api.lastChecked && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Last Checked
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {api.lastChecked.toLocaleTimeString()}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Rate Limit
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {api.name === "Postal Pincode API"
                      ? "10,000 / day"
                      : "5,000 / day"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleTestAPI(api.name)}
                disabled={testing || api.status === "testing"}
                className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <RefreshCcw
                  className={`h-4 w-4 ${
                    api.status === "testing" ? "animate-spin" : ""
                  }`}
                />
                Test Connection
              </button>
            </div>
          ))}
        </div>

        {/* Configuration Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Configuration
          </h2>

          <div className="space-y-6">
            {/* Postal Pincode API */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Postal Pincode API (India)</FormLabel>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.postalPincodeEnabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        postalPincodeEnabled: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {settings.postalPincodeEnabled && (
                <FormField label="API Key (Optional)">
                  <div>
                    <FormInput
                      type="password"
                      value={settings.postalPincodeApiKey || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          postalPincodeApiKey: e.target.value,
                        })
                      }
                      placeholder="Enter API key for premium tier"
                    />
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      Free tier: 10,000 requests/day. Premium tier: Higher
                      limits
                    </p>
                  </div>
                </FormField>
              )}
            </div>

            {/* Zippopotam API */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <FormLabel>Zippopotam API (International)</FormLabel>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.zippopotamEnabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        zippopotamEnabled: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                Free tier: 5,000 requests/day. Supports 50+ countries.
              </p>
            </div>

            {/* Cache Settings */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <FormLabel>Enable Caching</FormLabel>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.cacheEnabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        cacheEnabled: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {settings.cacheEnabled && (
                <FormField label="Cache Duration">
                  <div>
                    <FormSelect
                      value={settings.cacheTime.toString()}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          cacheTime: parseInt(e.target.value),
                        })
                      }
                      options={[
                        { value: String(60 * 60 * 1000), label: "1 Hour" },
                        { value: String(6 * 60 * 60 * 1000), label: "6 Hours" },
                        {
                          value: String(12 * 60 * 60 * 1000),
                          label: "12 Hours",
                        },
                        {
                          value: String(24 * 60 * 60 * 1000),
                          label: "24 Hours",
                        },
                        {
                          value: String(7 * 24 * 60 * 60 * 1000),
                          label: "7 Days",
                        },
                      ]}
                    />
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      Cache postal code lookups to reduce API calls
                    </p>
                  </div>
                </FormField>
              )}
            </div>

            {/* Fallback Settings */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <FormLabel>Enable Fallback</FormLabel>
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
                </label>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use fallback country data when APIs are unavailable
              </p>
            </div>
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
          <div className="ml-auto flex gap-3">
            <button
              onClick={checkAPIStatuses}
              disabled={testing}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <RefreshCcw
                className={`h-4 w-4 ${testing ? "animate-spin" : ""}`}
              />
              Refresh Status
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
