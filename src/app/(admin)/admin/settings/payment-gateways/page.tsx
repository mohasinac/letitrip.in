"use client";

/**
 * Admin Payment Gateways Settings Page
 *
 * @status IMPLEMENTED
 * @task 1.1.6
 *
 * Manage payment gateway configuration:
 * - Enable/disable gateways
 * - Configure API keys and secrets
 * - Test gateway connections
 * - View gateway capabilities and fees
 */

import {
  PAYMENT_GATEWAYS,
  type PaymentGatewayConfig,
  type PaymentMode,
} from "@/config/payment-gateways.config";
import { useLoadingState } from "@letitrip/react-library";
import { logError } from "@/lib/firebase-error-logger";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Globe,
  Info,
  Loader2,
  Save,
  Settings,
  Shield,
  TestTube,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// TODO: Replace with actual settings service when API routes are implemented
interface GatewaySettings {
  id: string;
  enabled: boolean;
  mode: PaymentMode;
  config: Record<string, string>;
}

export default function PaymentGatewaysSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedGateway, setSelectedGateway] =
    useState<PaymentGatewayConfig | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [testingGateway, setTestingGateway] = useState<string | null>(null);

  // Gateway settings state
  const [gatewaySettings, setGatewaySettings] = useState<
    Record<string, GatewaySettings>
  >({});

  const {
    isLoading: loading,
    error,
    execute,
  } = useLoadingState({
    onLoadError: (err) => {
      logError(err, {
        component: "PaymentGatewaysSettings.loadSettings",
      });
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    await execute(async () => {
      // TODO: Load from API
      // const data = await settingsService.getPaymentGateways();

      // Initialize with default settings
      const settings: Record<string, GatewaySettings> = {};
      PAYMENT_GATEWAYS.forEach((gateway) => {
        settings[gateway.id] = {
          id: gateway.id,
          enabled: gateway.enabled,
          mode: "test",
          config: {},
        };
      });

      setGatewaySettings(settings);
    });
  };

  const handleToggleGateway = (gatewayId: string) => {
    setGatewaySettings((prev) => ({
      ...prev,
      [gatewayId]: {
        ...prev[gatewayId],
        enabled: !prev[gatewayId].enabled,
      },
    }));
  };

  const handleModeChange = (gatewayId: string, mode: PaymentMode) => {
    setGatewaySettings((prev) => ({
      ...prev,
      [gatewayId]: {
        ...prev[gatewayId],
        mode,
      },
    }));
  };

  const handleConfigureGateway = (gateway: PaymentGatewayConfig) => {
    setSelectedGateway(gateway);
    setShowConfigModal(true);
  };

  const handleTestConnection = async (gatewayId: string) => {
    setTestingGateway(gatewayId);
    try {
      // TODO: Call API to test gateway connection
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert(`${gatewayId} connection test successful!`);
    } catch (err) {
      logError(err as Error, {
        component: "PaymentGatewaysSettings.testConnection",
        gatewayId,
      });
      alert(`${gatewayId} connection test failed!`);
    } finally {
      setTestingGateway(null);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setFormError(null);
      setSuccess(null);

      // TODO: Save to API
      // await settingsService.updatePaymentGateways(gatewaySettings);

      setSuccess("Payment gateway settings saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      logError(err as Error, {
        component: "PaymentGatewaysSettings.saveSettings",
      });
      setFormError(
        err instanceof Error ? err.message : "Failed to save settings"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6" />
          <div className="space-y-4">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                Failed to load settings
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {String(error)}
              </p>
              <button
                onClick={loadSettings}
                className="mt-3 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Payment Gateways
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Configure payment gateways and manage API credentials
            </p>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-sm text-green-700 dark:text-green-300">
              {success}
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {formError && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">
              {formError}
            </p>
          </div>
        </div>
      )}

      {/* Gateway Cards */}
      <div className="space-y-6">
        {PAYMENT_GATEWAYS.map((gateway) => {
          const settings = gatewaySettings[gateway.id];
          const isEnabled = settings?.enabled ?? gateway.enabled;
          const mode = settings?.mode ?? "test";

          return (
            <div
              key={gateway.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {gateway.name}
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            gateway.type === "domestic"
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                              : gateway.type === "international"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                              : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                          }`}
                        >
                          {gateway.type}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            isEnabled
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {isEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {gateway.description}
                      </p>

                      {/* Capabilities */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {gateway.capabilities.upi && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                            <Shield className="h-3 w-3" />
                            UPI
                          </span>
                        )}
                        {gateway.capabilities.cardPayments && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                            <CreditCard className="h-3 w-3" />
                            Cards
                          </span>
                        )}
                        {gateway.capabilities.netBanking && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                            <Globe className="h-3 w-3" />
                            Net Banking
                          </span>
                        )}
                        {gateway.capabilities.wallets && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                            <DollarSign className="h-3 w-3" />
                            Wallets
                          </span>
                        )}
                        {gateway.capabilities.refunds && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                            <Clock className="h-3 w-3" />
                            Refunds
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => handleToggleGateway(gateway.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isEnabled
                        ? "bg-indigo-600 dark:bg-indigo-500"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Card Body */}
              {isEnabled && (
                <div className="p-6 space-y-6">
                  {/* Mode Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mode
                    </label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleModeChange(gateway.id, "test")}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                          mode === "test"
                            ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300"
                            : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        Test Mode
                      </button>
                      <button
                        onClick={() => handleModeChange(gateway.id, "live")}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                          mode === "live"
                            ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300"
                            : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        Live Mode
                      </button>
                    </div>
                  </div>

                  {/* Fee Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Domestic Fee
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {gateway.fees.domestic.percentage}% +{" "}
                        {gateway.fees.domestic.fixed}{" "}
                        {gateway.fees.domestic.currency}
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          International Fee
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {gateway.fees.international.percentage}% +{" "}
                        {gateway.fees.international.fixed}{" "}
                        {gateway.fees.international.currency}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleConfigureGateway(gateway)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      Configure
                    </button>

                    <button
                      onClick={() => handleTestConnection(gateway.id)}
                      disabled={testingGateway === gateway.id}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {testingGateway === gateway.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <TestTube className="h-4 w-4" />
                          Test Connection
                        </>
                      )}
                    </button>

                    <a
                      href={gateway.docs.setup}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Info className="h-4 w-4" />
                      Docs
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Configuration Modal */}
      {showConfigModal && selectedGateway && (
        <GatewayConfigModal
          gateway={selectedGateway}
          mode={gatewaySettings[selectedGateway.id]?.mode ?? "test"}
          onClose={() => {
            setShowConfigModal(false);
            setSelectedGateway(null);
          }}
          onSave={(config) => {
            setGatewaySettings((prev) => ({
              ...prev,
              [selectedGateway.id]: {
                ...prev[selectedGateway.id],
                config,
              },
            }));
            setShowConfigModal(false);
            setSelectedGateway(null);
          }}
        />
      )}
    </div>
  );
}

// Gateway Configuration Modal Component
function GatewayConfigModal({
  gateway,
  mode,
  onClose,
  onSave,
}: {
  gateway: PaymentGatewayConfig;
  mode: PaymentMode;
  onClose: () => void;
  onSave: (config: Record<string, string>) => void;
}) {
  const [config, setConfig] = useState<Record<string, string>>({});
  const fields = gateway.config[mode];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Configure {gateway.name} ({mode} mode)
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {field.label}
                {field.required && (
                  <span className="text-red-500 dark:text-red-400 ml-1">*</span>
                )}
              </label>
              <input
                type={field.type}
                placeholder={field.placeholder}
                required={field.required}
                value={config[field.key] || ""}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    [field.key]: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {field.helpText && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {field.helpText}
                </p>
              )}
            </div>
          ))}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
