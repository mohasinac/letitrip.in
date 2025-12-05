"use client";

/**
 * Admin Payment Settings Page
 *
 * @status IMPLEMENTED
 * @epic E021 - System Configuration
 *
 * Manage payment gateway configuration including:
 * - Razorpay settings
 * - PayU settings
 * - COD settings
 * - Currency configuration
 */

import { FormInput } from "@/components/forms/FormInput";
import { FormSelect } from "@/components/forms/FormSelect";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import {
  settingsService,
  type PaymentSettings,
} from "@/services/settings.service";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminPaymentSettingsPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "razorpay" | "payu" | "cod" | "currency"
  >("razorpay");

  // Track if secrets have been modified
  const [razorpaySecretModified, setRazorpaySecretModified] = useState(false);
  const [payuSaltModified, setPayuSaltModified] = useState(false);

  const {
    isLoading: loading,
    error,
    data: settings,
    setData: setSettings,
    execute,
  } = useLoadingState<PaymentSettings | null>({
    initialData: null,
    onLoadError: (err) => {
      logError(err, {
        component: "AdminPaymentSettings.loadSettings",
      });
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    await execute(async () => {
      const data = await settingsService.getPayment();
      return data;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      setSaving(true);
      setSuccess(null);

      // Prepare settings - only include secrets if modified
      const updatePayload: Partial<PaymentSettings> = {
        ...settings,
      };

      // Remove masked secrets if not modified
      if (
        !razorpaySecretModified &&
        updatePayload.razorpay?.keySecret === "••••••••"
      ) {
        delete updatePayload.razorpay?.keySecret;
      }
      if (
        !payuSaltModified &&
        updatePayload.payu?.merchantSalt === "••••••••"
      ) {
        delete updatePayload.payu?.merchantSalt;
      }

      await settingsService.updatePayment(updatePayload);
      setSuccess("Payment settings saved successfully!");
      setRazorpaySecretModified(false);
      setPayuSaltModified(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setFormError(
        err instanceof Error ? err.message : "Failed to save settings"
      );
    } finally {
      setSaving(false);
    }
  };

  const updateRazorpay = (
    field: keyof PaymentSettings["razorpay"],
    value: string | boolean
  ) => {
    if (!settings) return;
    setSettings({
      ...settings,
      razorpay: {
        ...settings.razorpay,
        [field]: value,
      },
    });
    if (field === "keySecret") {
      setRazorpaySecretModified(true);
    }
  };

  const updatePayu = (
    field: keyof PaymentSettings["payu"],
    value: string | boolean
  ) => {
    if (!settings) return;
    setSettings({
      ...settings,
      payu: {
        ...settings.payu,
        [field]: value,
      },
    });
    if (field === "merchantSalt") {
      setPayuSaltModified(true);
    }
  };

  const updateCod = (
    field: keyof PaymentSettings["cod"],
    value: boolean | number
  ) => {
    if (!settings) return;
    setSettings({
      ...settings,
      cod: {
        ...settings.cod,
        [field]: value,
      },
    });
  };

  const updateCurrency = (
    field: "currency" | "currencySymbol",
    value: string
  ) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [field]: value,
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
            {(error instanceof Error ? error.message : error) ||
              "Failed to load settings"}
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
    {
      id: "razorpay" as const,
      label: "Razorpay",
      icon: "💳",
      enabled: settings.razorpay.enabled,
    },
    {
      id: "payu" as const,
      label: "PayU",
      icon: "🏦",
      enabled: settings.payu.enabled,
    },
    {
      id: "cod" as const,
      label: "Cash on Delivery",
      icon: "💵",
      enabled: settings.cod.enabled,
    },
    { id: "currency" as const, label: "Currency", icon: "₹", enabled: true },
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
            <span>Payment</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Payment Settings
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

      {success && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-800 dark:text-green-200">{success}</p>
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
            {tab.id !== "currency" && (
              <span
                className={`w-2 h-2 rounded-full ${
                  tab.enabled ? "bg-green-400" : "bg-gray-400"
                }`}
              />
            )}
          </button>
        ))}
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        {/* Razorpay Tab */}
        {activeTab === "razorpay" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Razorpay Configuration
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {settings.razorpay.enabled ? "Enabled" : "Disabled"}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.razorpay.enabled}
                    onChange={(e) =>
                      updateRazorpay("enabled", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
                </label>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Get your Razorpay API keys from the{" "}
                <a
                  href="https://dashboard.razorpay.com/app/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  Razorpay Dashboard
                </a>
              </p>
            </div>

            <FormInput
              label="Key ID"
              value={settings.razorpay.keyId}
              onChange={(e) => updateRazorpay("keyId", e.target.value)}
              className="font-mono"
              placeholder="rzp_live_xxxxxxxxxxxxx"
            />

            <FormInput
              label="Key Secret"
              type="password"
              value={settings.razorpay.keySecret || ""}
              onChange={(e) => updateRazorpay("keySecret", e.target.value)}
              className="font-mono"
              placeholder="Enter new secret to update"
              helperText="Leave empty to keep existing secret. Secret is stored securely and never exposed."
            />

            <div className="flex items-center gap-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.razorpay.testMode}
                  onChange={(e) => updateRazorpay("testMode", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500" />
              </label>
              <span className="text-gray-700 dark:text-gray-300">
                Test Mode{" "}
                {settings.razorpay.testMode ? "(Active)" : "(Inactive)"}
              </span>
            </div>
            {settings.razorpay.testMode && (
              <p className="text-sm text-orange-600 dark:text-orange-400">
                ⚠️ Test mode is enabled. No real transactions will be processed.
              </p>
            )}
          </div>
        )}

        {/* PayU Tab */}
        {activeTab === "payu" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                PayU Configuration
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {settings.payu.enabled ? "Enabled" : "Disabled"}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.payu.enabled}
                    onChange={(e) => updatePayu("enabled", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
                </label>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Get your PayU credentials from the{" "}
                <a
                  href="https://payu.in/merchant-dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  PayU Dashboard
                </a>
              </p>
            </div>

            <FormInput
              label="Merchant Key"
              value={settings.payu.merchantKey}
              onChange={(e) => updatePayu("merchantKey", e.target.value)}
              className="font-mono"
              placeholder="Your PayU merchant key"
            />

            <FormInput
              label="Merchant Salt"
              type="password"
              value={settings.payu.merchantSalt || ""}
              onChange={(e) => updatePayu("merchantSalt", e.target.value)}
              className="font-mono"
              placeholder="Enter new salt to update"
              helperText="Leave empty to keep existing salt. Salt is stored securely and never exposed."
            />

            <div className="flex items-center gap-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.payu.testMode}
                  onChange={(e) => updatePayu("testMode", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500" />
              </label>
              <span className="text-gray-700 dark:text-gray-300">
                Test Mode {settings.payu.testMode ? "(Active)" : "(Inactive)"}
              </span>
            </div>
            {settings.payu.testMode && (
              <p className="text-sm text-orange-600 dark:text-orange-400">
                ⚠️ Test mode is enabled. No real transactions will be processed.
              </p>
            )}
          </div>
        )}

        {/* COD Tab */}
        {activeTab === "cod" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Cash on Delivery Settings
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {settings.cod.enabled ? "Enabled" : "Disabled"}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.cod.enabled}
                    onChange={(e) => updateCod("enabled", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Minimum Order Value (₹)"
                type="number"
                min={0}
                value={settings.cod.minOrderValue}
                onChange={(e) =>
                  updateCod("minOrderValue", Number(e.target.value))
                }
                helperText="Set to 0 for no minimum"
              />

              <FormInput
                label="Maximum Order Value (₹)"
                type="number"
                min={0}
                value={settings.cod.maxOrderValue}
                onChange={(e) =>
                  updateCod("maxOrderValue", Number(e.target.value))
                }
                helperText="COD will not be available for orders above this amount"
              />
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                COD Order Range
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {settings.cod.minOrderValue > 0 ? (
                  <>
                    Cash on Delivery is available for orders between{" "}
                    <span className="font-semibold">
                      ₹{settings.cod.minOrderValue}
                    </span>{" "}
                    and{" "}
                    <span className="font-semibold">
                      ₹{settings.cod.maxOrderValue}
                    </span>
                  </>
                ) : (
                  <>
                    Cash on Delivery is available for orders up to{" "}
                    <span className="font-semibold">
                      ₹{settings.cod.maxOrderValue}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Currency Tab */}
        {activeTab === "currency" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Currency Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                label="Currency Code"
                value={settings.currency}
                onChange={(e) => updateCurrency("currency", e.target.value)}
                options={[
                  { value: "INR", label: "INR - Indian Rupee" },
                  { value: "USD", label: "USD - US Dollar" },
                  { value: "EUR", label: "EUR - Euro" },
                  { value: "GBP", label: "GBP - British Pound" },
                ]}
              />

              <FormInput
                label="Currency Symbol"
                value={settings.currencySymbol}
                onChange={(e) =>
                  updateCurrency("currencySymbol", e.target.value)
                }
                className="text-center text-xl"
                maxLength={3}
              />
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preview
              </h3>
              <p className="text-2xl text-gray-900 dark:text-white">
                {settings.currencySymbol}1,234.56
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
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {saving ? (
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

      {/* Payment Methods Summary */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Active Payment Methods
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PaymentMethodStatus
            name="Razorpay"
            enabled={settings.razorpay.enabled}
            testMode={settings.razorpay.testMode}
            configured={!!settings.razorpay.keyId}
          />
          <PaymentMethodStatus
            name="PayU"
            enabled={settings.payu.enabled}
            testMode={settings.payu.testMode}
            configured={!!settings.payu.merchantKey}
          />
          <PaymentMethodStatus
            name="Cash on Delivery"
            enabled={settings.cod.enabled}
            configured={true}
          />
        </div>
      </div>
    </div>
  );
}

function PaymentMethodStatus({
  name,
  enabled,
  testMode,
  configured,
}: {
  name: string;
  enabled: boolean;
  testMode?: boolean;
  configured: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-lg border ${
        enabled
          ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
          : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-gray-900 dark:text-white">{name}</h3>
        <span
          className={`w-3 h-3 rounded-full ${
            enabled ? "bg-green-500" : "bg-gray-400"
          }`}
        />
      </div>
      <div className="space-y-1 text-sm">
        <p
          className={
            enabled
              ? "text-green-700 dark:text-green-300"
              : "text-gray-500 dark:text-gray-400"
          }
        >
          {enabled ? "Enabled" : "Disabled"}
        </p>
        {testMode !== undefined && enabled && (
          <p
            className={
              testMode
                ? "text-orange-600 dark:text-orange-400"
                : "text-green-700 dark:text-green-300"
            }
          >
            {testMode ? "Test Mode" : "Live Mode"}
          </p>
        )}
        {!configured && (
          <p className="text-red-600 dark:text-red-400">Not configured</p>
        )}
      </div>
    </div>
  );
}
