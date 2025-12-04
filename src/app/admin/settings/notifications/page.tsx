"use client";

/**
 * Admin Notification Settings Page
 *
 * @status IMPLEMENTED
 * @epic E021 - System Configuration
 *
 * Manage global notification settings:
 * - Push notifications
 * - In-app notifications
 * - Notification preferences
 */

import { FormInput, FormSelect } from "@/components/forms";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import { apiService } from "@/services/api.service";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Bell,
  BellOff,
  BellRing,
  CheckCircle,
  CreditCard,
  Loader2,
  Mail,
  MessageSquare,
  Monitor,
  Package,
  Save,
  ShoppingBag,
  Smartphone,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface NotificationCategory {
  enabled: boolean;
  channels: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

interface NotificationSettings {
  globalEnabled: boolean;
  categories: {
    orders: NotificationCategory;
    shipping: NotificationCategory;
    payments: NotificationCategory;
    reviews: NotificationCategory;
    returns: NotificationCategory;
    promotions: NotificationCategory;
    security: NotificationCategory;
    system: NotificationCategory;
  };
  digest: {
    enabled: boolean;
    frequency: "daily" | "weekly" | "never";
    time: string;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const DEFAULT_SETTINGS: NotificationSettings = {
  globalEnabled: true,
  categories: {
    orders: {
      enabled: true,
      channels: { email: true, push: true, inApp: true },
    },
    shipping: {
      enabled: true,
      channels: { email: true, push: true, inApp: true },
    },
    payments: {
      enabled: true,
      channels: { email: true, push: true, inApp: true },
    },
    reviews: {
      enabled: true,
      channels: { email: true, push: false, inApp: true },
    },
    returns: {
      enabled: true,
      channels: { email: true, push: true, inApp: true },
    },
    promotions: {
      enabled: false,
      channels: { email: false, push: false, inApp: true },
    },
    security: {
      enabled: true,
      channels: { email: true, push: true, inApp: true },
    },
    system: {
      enabled: true,
      channels: { email: false, push: false, inApp: true },
    },
  },
  digest: {
    enabled: true,
    frequency: "daily",
    time: "09:00",
  },
  quietHours: {
    enabled: false,
    start: "22:00",
    end: "08:00",
  },
};

const categoryInfo: Record<
  keyof NotificationSettings["categories"],
  { label: string; description: string; icon: React.ReactNode }
> = {
  orders: {
    label: "Orders",
    description: "New orders, order updates, cancellations",
    icon: <ShoppingBag className="w-5 h-5 text-blue-500" />,
  },
  shipping: {
    label: "Shipping",
    description: "Shipping updates, delivery notifications",
    icon: <Package className="w-5 h-5 text-green-500" />,
  },
  payments: {
    label: "Payments",
    description: "Payment confirmations, refunds, payouts",
    icon: <CreditCard className="w-5 h-5 text-purple-500" />,
  },
  reviews: {
    label: "Reviews",
    description: "New reviews, review responses",
    icon: <Star className="w-5 h-5 text-yellow-500" />,
  },
  returns: {
    label: "Returns",
    description: "Return requests, return status updates",
    icon: <Package className="w-5 h-5 text-orange-500" />,
  },
  promotions: {
    label: "Promotions",
    description: "Marketing campaigns, special offers",
    icon: <MessageSquare className="w-5 h-5 text-pink-500" />,
  },
  security: {
    label: "Security",
    description: "Login alerts, password changes, suspicious activity",
    icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
  },
  system: {
    label: "System",
    description: "Maintenance notices, feature updates",
    icon: <Monitor className="w-5 h-5 text-gray-500" />,
  },
};

export default function AdminNotificationSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    isLoading: loading,
    error,
    data: settings,
    setData: setSettings,
    execute,
  } = useLoadingState<NotificationSettings>({
    initialData: DEFAULT_SETTINGS,
    onLoadError: (err) => {
      logError(err, {
        component: "AdminNotificationSettings.loadSettings",
      });
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.get<{ settings: NotificationSettings }>(
        "/api/admin/settings?category=notifications",
      );
      if (response.settings) {
        setSettings({ ...DEFAULT_SETTINGS, ...response.settings });
      }
    } catch (err) {
      console.error("Error loading settings:", err);
      // Use defaults if API fails
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await apiService.put("/api/admin/settings", {
        category: "notifications",
        settings,
      });
      setSuccess("Notification settings saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (
    category: keyof NotificationSettings["categories"],
  ) => {
    setSettings({
      ...settings,
      categories: {
        ...settings.categories,
        [category]: {
          ...settings.categories[category],
          enabled: !settings.categories[category].enabled,
        },
      },
    });
  };

  const toggleChannel = (
    category: keyof NotificationSettings["categories"],
    channel: "email" | "push" | "inApp",
  ) => {
    setSettings({
      ...settings,
      categories: {
        ...settings.categories,
        [category]: {
          ...settings.categories[category],
          channels: {
            ...settings.categories[category].channels,
            [channel]: !settings.categories[category].channels[channel],
          },
        },
      },
    });
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
            <span>Notifications</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Notification Settings
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
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <p className="text-green-800 dark:text-green-200">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Global Toggle */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.globalEnabled ? (
                <BellRing className="w-6 h-6 text-blue-500" />
              ) : (
                <BellOff className="w-6 h-6 text-gray-400" />
              )}
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Global Notifications
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Master switch for all notifications
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setSettings({
                  ...settings,
                  globalEnabled: !settings.globalEnabled,
                })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.globalEnabled
                  ? "bg-blue-600"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.globalEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Notification Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Notification Categories
          </h2>

          {/* Channel Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 pb-2 mb-2 border-b border-gray-200 dark:border-gray-700">
            <div className="col-span-6" />
            <div className="col-span-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
              <Mail className="w-3 h-3" />
              Email
            </div>
            <div className="col-span-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
              <Smartphone className="w-3 h-3" />
              Push
            </div>
            <div className="col-span-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
              <Monitor className="w-3 h-3" />
              In-App
            </div>
          </div>

          <div className="space-y-4">
            {(
              Object.keys(settings.categories) as Array<
                keyof NotificationSettings["categories"]
              >
            ).map((category) => {
              const info = categoryInfo[category];
              const cat = settings.categories[category];

              return (
                <div
                  key={category}
                  className={`grid md:grid-cols-12 gap-4 p-3 rounded-lg transition-colors ${
                    cat.enabled
                      ? "bg-gray-50 dark:bg-gray-700/30"
                      : "bg-gray-100/50 dark:bg-gray-800/50 opacity-60"
                  }`}
                >
                  {/* Category Info */}
                  <div className="md:col-span-5 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className={`p-2 rounded-lg ${
                        cat.enabled
                          ? "bg-white dark:bg-gray-700"
                          : "bg-gray-200 dark:bg-gray-600"
                      }`}
                    >
                      {info.icon}
                    </button>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {info.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {info.description}
                      </p>
                    </div>
                  </div>

                  {/* Enable Toggle */}
                  <div className="md:col-span-1 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        cat.enabled
                          ? "bg-blue-600"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          cat.enabled ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Channel Toggles */}
                  {(["email", "push", "inApp"] as const).map((channel) => (
                    <div
                      key={channel}
                      className="md:col-span-2 flex items-center justify-center"
                    >
                      <label className="md:hidden text-xs text-gray-500 mr-2">
                        {channel === "inApp"
                          ? "In-App"
                          : channel.charAt(0).toUpperCase() + channel.slice(1)}
                        :
                      </label>
                      <input
                        type="checkbox"
                        checked={cat.channels[channel]}
                        onChange={() => toggleChannel(category, channel)}
                        disabled={!cat.enabled || !settings.globalEnabled}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Digest Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Daily Digest
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Receive a summary of notifications instead of individual alerts
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setSettings({
                  ...settings,
                  digest: {
                    ...settings.digest,
                    enabled: !settings.digest.enabled,
                  },
                })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.digest.enabled
                  ? "bg-blue-600"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.digest.enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {settings.digest.enabled && (
            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <FormSelect
                id="digest-frequency"
                label="Frequency"
                value={settings.digest.frequency}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    digest: {
                      ...settings.digest,
                      frequency: e.target.value as "daily" | "weekly" | "never",
                    },
                  })
                }
                options={[
                  { value: "daily", label: "Daily" },
                  { value: "weekly", label: "Weekly" },
                ]}
              />
              <FormInput
                id="digest-time"
                label="Send Time"
                type="time"
                value={settings.digest.time}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    digest: { ...settings.digest, time: e.target.value },
                  })
                }
              />
            </div>
          )}
        </div>

        {/* Quiet Hours */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Quiet Hours
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pause push notifications during specific hours
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setSettings({
                  ...settings,
                  quietHours: {
                    ...settings.quietHours,
                    enabled: !settings.quietHours.enabled,
                  },
                })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.quietHours.enabled
                  ? "bg-blue-600"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.quietHours.enabled
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {settings.quietHours.enabled && (
            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <FormInput
                id="quiet-start"
                label="Start Time"
                type="time"
                value={settings.quietHours.start}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    quietHours: {
                      ...settings.quietHours,
                      start: e.target.value,
                    },
                  })
                }
              />
              <FormInput
                id="quiet-end"
                label="End Time"
                type="time"
                value={settings.quietHours.end}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    quietHours: {
                      ...settings.quietHours,
                      end: e.target.value,
                    },
                  })
                }
              />
            </div>
          )}
        </div>

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
