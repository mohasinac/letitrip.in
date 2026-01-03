"use client";

/**
 * Admin Shipping Settings Page
 *
 * @status IMPLEMENTED
 * @epic E021 - System Configuration
 *
 * Manage shipping configuration:
 * - Free shipping threshold
 * - Shipping rates
 * - Delivery estimates
 * - Restricted pincodes
 */

import { FormLabel } from "@/components/forms/FormLabel";
import { useFormState } from "@/hooks/useFormState";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import {
  settingsService,
  type ShippingSettings,
} from "@/services/settings.service";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Loader2,
  MapPin,
  Package,
  Plus,
  Save,
  Truck,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

const DEFAULT_SETTINGS: ShippingSettings = {
  freeShippingThreshold: 999,
  defaultShippingCharge: 49,
  expressShippingCharge: 99,
  expressShippingEnabled: true,
  estimatedDeliveryDays: {
    standard: { min: 5, max: 7 },
    express: { min: 2, max: 3 },
  },
  restrictedPincodes: [],
};

interface ShippingFormState {
  saving: boolean;
  formError: string | null;
  success: string | null;
  newPincode: string;
  testing: boolean;
  testResult: { success: boolean; message: string } | null;
}

export default function AdminShippingSettingsPage() {
  const { formData: formState, setField: setFormState } =
    useFormState<ShippingFormState>({
      saving: false,
      formError: null,
      success: null,
      newPincode: "",
      testing: false,
      testResult: null,
    });

  const {
    isLoading: loading,
    error,
    data: settings,
    setData: setSettings,
    execute,
  } = useLoadingState<ShippingSettings>({
    initialData: DEFAULT_SETTINGS,
    onLoadError: (err) => {
      logError(err, {
        component: "AdminShippingSettings.loadSettings",
      });
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    await execute(async () => {
      const data = await settingsService.getShipping();
      return { ...DEFAULT_SETTINGS, ...data };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setFormState("saving", true);
      setFormState("formError", null);
      setFormState("success", null);
      if (!settings) return;
      await settingsService.updateShipping(settings);
      setFormState("success", "Shipping settings saved successfully!");
      setTimeout(() => setFormState("success", null), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setFormState(
        "formError",
        err instanceof Error ? err.message : "Failed to save settings"
      );
    } finally {
      setFormState("saving", false);
    }
  };

  const addRestrictedPincode = () => {
    const pincode = formState.newPincode.trim();
    if (
      pincode &&
      /^\d{6}$/.test(pincode) &&
      settings &&
      !settings.restrictedPincodes.includes(pincode)
    ) {
      setSettings({
        ...settings,
        restrictedPincodes: [...settings.restrictedPincodes, pincode],
      });
      setFormState("newPincode", "");
    }
  };

  const removeRestrictedPincode = (pincode: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      restrictedPincodes: settings.restrictedPincodes.filter(
        (p) => p !== pincode
      ),
    });
  };

  const handleTestConnection = async () => {
    if (!settings?.shiprocket?.email || !settings?.shiprocket?.password) {
      setFormState("testResult", {
        success: false,
        message: "Please enter both email and password",
      });
      return;
    }

    try {
      setFormState("testing", true);
      setFormState("testResult", null);
      const result = await settingsService.testShiprocketConnection(
        settings.shiprocket.email,
        settings.shiprocket.password
      );
      setFormState("testResult", result);
    } catch (err) {
      console.error("Error testing connection:", err);
      setFormState("testResult", {
        success: false,
        message:
          err instanceof Error ? err.message : "Failed to test connection",
      });
    } finally {
      setFormState("testing", false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
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
            <span>Shipping</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Truck className="w-6 h-6" />
            Shipping Settings
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

      {formState.formError && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 dark:text-red-200">
            {formState.formError}
          </p>
        </div>
      )}

      {formState.success && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <p className="text-green-800 dark:text-green-200">
            {formState.success}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Shiprocket Integration */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-500" />
                Shiprocket Integration
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Connect with Shiprocket for automated shipping and tracking
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.shiprocket?.enabled || false}
                onChange={(e) => {
                  if (settings) {
                    setSettings({
                      ...settings,
                      shiprocket: {
                        enabled: e.target.checked,
                        email: settings.shiprocket?.email || "",
                        password: settings.shiprocket?.password || "",
                      },
                    });
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500" />
            </label>
          </div>

          {settings?.shiprocket?.enabled && (
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  Get your Shiprocket API credentials from the{" "}
                  <a
                    href="https://app.shiprocket.in/account/api-user"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    Shiprocket Dashboard
                  </a>
                </p>
              </div>

              <div>
                <FormLabel htmlFor="shiprocket-email">
                  Shiprocket Email
                </FormLabel>
                <input
                  id="shiprocket-email"
                  type="email"
                  value={settings?.shiprocket?.email || ""}
                  onChange={(e) => {
                    if (settings) {
                      setSettings({
                        ...settings,
                        shiprocket: {
                          enabled: settings.shiprocket?.enabled || false,
                          email: e.target.value,
                          password: settings.shiprocket?.password || "",
                        },
                      });
                    }
                  }}
                  placeholder="your-email@example.com"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <FormLabel htmlFor="shiprocket-password">
                  Shiprocket Password
                </FormLabel>
                <input
                  id="shiprocket-password"
                  type="password"
                  value={settings?.shiprocket?.password || ""}
                  onChange={(e) => {
                    if (settings) {
                      setSettings({
                        ...settings,
                        shiprocket: {
                          enabled: settings.shiprocket?.enabled || false,
                          email: settings.shiprocket?.email || "",
                          password: e.target.value,
                        },
                      });
                    }
                  }}
                  placeholder="Enter password"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Password is stored securely and never exposed
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={formState.testing}
                    className="px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {formState.testing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      "Test Connection"
                    )}
                  </button>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Click to verify your credentials
                  </span>
                </div>

                {formState.testResult && (
                  <div
                    className={`p-3 rounded-lg flex items-start gap-2 ${
                      formState.testResult.success
                        ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                    }`}
                  >
                    {formState.testResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <p
                      className={`text-sm ${
                        formState.testResult.success
                          ? "text-green-800 dark:text-green-200"
                          : "text-red-800 dark:text-red-200"
                      }`}
                    >
                      {formState.testResult.message}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Features Enabled
                </h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Automatic AWB generation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Courier selection & rate calculation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Automated pickup scheduling
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Real-time tracking updates
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Label & manifest generation
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Free Shipping */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-green-500" />
            Free Shipping
          </h2>
          <div className="grid gap-4">
            <div>
              <FormLabel htmlFor="shipping-free-threshold">
                Free Shipping Threshold
              </FormLabel>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Orders above this amount qualify for free shipping
              </p>
              <div className="relative max-w-xs">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ₹
                </span>
                <input
                  id="shipping-free-threshold"
                  type="number"
                  value={settings?.freeShippingThreshold ?? 0}
                  onChange={(e) => {
                    if (settings) {
                      setSettings({
                        ...settings,
                        freeShippingThreshold: parseInt(e.target.value) || 0,
                      });
                    }
                  }}
                  min="0"
                  className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Charges */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-500" />
            Shipping Charges
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <FormLabel htmlFor="shipping-standard-charge">
                Standard Shipping Charge
              </FormLabel>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ₹
                </span>
                <input
                  id="shipping-standard-charge"
                  type="number"
                  value={settings?.defaultShippingCharge ?? 0}
                  onChange={(e) => {
                    if (settings) {
                      setSettings({
                        ...settings,
                        defaultShippingCharge: parseInt(e.target.value) || 0,
                      });
                    }
                  }}
                  min="0"
                  className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <FormLabel htmlFor="shipping-express-charge">
                Express Shipping Charge
              </FormLabel>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ₹
                </span>
                <input
                  id="shipping-express-charge"
                  type="number"
                  value={settings?.expressShippingCharge ?? 0}
                  onChange={(e) => {
                    if (settings) {
                      setSettings({
                        ...settings,
                        expressShippingCharge: parseInt(e.target.value) || 0,
                      });
                    }
                  }}
                  min="0"
                  disabled={!settings?.expressShippingEnabled}
                  className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Express Shipping Toggle */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Express Shipping
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (settings) {
                    setSettings({
                      ...settings,
                      expressShippingEnabled: !settings.expressShippingEnabled,
                    });
                  }
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings?.expressShippingEnabled
                    ? "bg-blue-600"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings?.expressShippingEnabled
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </label>
          </div>
        </div>

        {/* Delivery Estimates */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            Delivery Estimates
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Standard Delivery */}
            <div>
              <FormLabel htmlFor="shipping-standard-min">
                Standard Delivery (days)
              </FormLabel>
              <div className="flex items-center gap-2">
                <input
                  id="shipping-standard-min"
                  type="number"
                  value={settings?.estimatedDeliveryDays?.standard?.min ?? 3}
                  onChange={(e) => {
                    if (
                      settings &&
                      settings.estimatedDeliveryDays &&
                      settings.estimatedDeliveryDays.standard
                    ) {
                      setSettings({
                        ...settings,
                        estimatedDeliveryDays: {
                          ...settings.estimatedDeliveryDays,
                          standard: {
                            ...settings.estimatedDeliveryDays.standard,
                            min: parseInt(e.target.value) || 1,
                          },
                        },
                      });
                    }
                  }}
                  min="1"
                  className="w-20 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-center"
                />
                <span className="text-gray-500 dark:text-gray-400">to</span>
                <input
                  type="number"
                  value={settings?.estimatedDeliveryDays?.standard?.max ?? 7}
                  onChange={(e) => {
                    if (settings) {
                      setSettings({
                        ...settings,
                        estimatedDeliveryDays: {
                          ...settings.estimatedDeliveryDays,
                          standard: {
                            ...settings.estimatedDeliveryDays.standard,
                            max: parseInt(e.target.value) || 7,
                          },
                        },
                      });
                    }
                  }}
                  min="1"
                  className="w-20 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-center"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  business days
                </span>
              </div>
            </div>

            {/* Express Delivery */}
            <div>
              <FormLabel htmlFor="shipping-express-min">
                Express Delivery (days)
              </FormLabel>
              <div className="flex items-center gap-2">
                <input
                  id="shipping-express-min"
                  type="number"
                  value={settings?.estimatedDeliveryDays?.express?.min ?? 1}
                  onChange={(e) => {
                    if (settings) {
                      setSettings({
                        ...settings,
                        estimatedDeliveryDays: {
                          ...settings.estimatedDeliveryDays,
                          express: {
                            ...settings.estimatedDeliveryDays.express,
                            min: parseInt(e.target.value) || 1,
                          },
                        },
                      });
                    }
                  }}
                  min="1"
                  disabled={!settings?.expressShippingEnabled}
                  className="w-20 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-center disabled:opacity-50"
                />
                <span className="text-gray-500 dark:text-gray-400">to</span>
                <input
                  type="number"
                  value={settings?.estimatedDeliveryDays?.express?.max ?? 3}
                  onChange={(e) => {
                    if (settings) {
                      setSettings({
                        ...settings,
                        estimatedDeliveryDays: {
                          ...settings.estimatedDeliveryDays,
                          express: {
                            ...settings.estimatedDeliveryDays.express,
                            max: parseInt(e.target.value) || 3,
                          },
                        },
                      });
                    }
                  }}
                  min="1"
                  disabled={!settings?.expressShippingEnabled}
                  className="w-20 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-center disabled:opacity-50"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  business days
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Restricted Pincodes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-500" />
            Restricted Pincodes
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Shipping is not available to these pincodes
          </p>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={formState.newPincode}
              onChange={(e) =>
                setFormState(
                  "newPincode",
                  e.target.value.replace(/\D/g, "").slice(0, 6)
                )
              }
              placeholder="Enter 6-digit pincode"
              className="flex-1 max-w-xs px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addRestrictedPincode}
              disabled={!/^\d{6}$/.test(formState.newPincode)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {settings && settings.restrictedPincodes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {settings.restrictedPincodes.map((pincode) => (
                <div
                  key={pincode}
                  className="flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full text-sm"
                >
                  {pincode}
                  <button
                    type="button"
                    onClick={() => removeRestrictedPincode(pincode)}
                    className="p-0.5 hover:bg-red-200 dark:hover:bg-red-800 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">
              No restricted pincodes configured
            </p>
          )}
        </div>

        {/* Summary Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
            Shipping Summary
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>
              • Free shipping on orders above{" "}
              <strong>
                {settings
                  ? formatCurrency(settings.freeShippingThreshold)
                  : "N/A"}
              </strong>
            </li>
            <li>
              • Standard shipping:{" "}
              <strong>
                {settings
                  ? formatCurrency(settings.defaultShippingCharge)
                  : "N/A"}
              </strong>{" "}
              ({settings?.estimatedDeliveryDays?.standard?.min || 0}-
              {settings?.estimatedDeliveryDays?.standard?.max || 0} days)
            </li>
            {settings?.expressShippingEnabled && (
              <li>
                • Express shipping:{" "}
                <strong>
                  {formatCurrency(settings.expressShippingCharge)}
                </strong>{" "}
                ({settings?.estimatedDeliveryDays?.express?.min || 0}-
                {settings?.estimatedDeliveryDays?.express?.max || 0} days)
              </li>
            )}
            <li>
              • {settings?.restrictedPincodes?.length || 0} restricted pincodes
            </li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={formState.saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {formState.saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {formState.saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
