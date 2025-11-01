"use client";

import React, { useState, useEffect } from "react";
import {
  Save,
  RefreshCw,
  Globe,
  Mail,
  CreditCard,
  Truck,
  Receipt,
  ToggleLeft,
  Wrench,
  Search as SearchIcon,
  Share2,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { PageHeader } from "@/components/ui/admin-seller/PageHeader";
import { UnifiedAlert } from "@/components/ui/unified";
import { UnifiedButton } from "@/components/ui/unified/Button";
import { SimpleTabs } from "@/components/ui/unified/Tabs";

interface Settings {
  general: GeneralSettings;
  email: EmailSettings;
  payment: PaymentSettings;
  shipping: ShippingSettings;
  tax: TaxSettings;
  features: FeaturesSettings;
  maintenance: MaintenanceSettings;
  seo: SEOSettings;
  social: SocialSettings;
  updatedAt: string;
}

interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  contactEmail: string;
  supportEmail: string;
  phoneNumber: string;
  address: string;
  timezone: string;
  currency: string;
  language: string;
}

interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  templates: {
    [key: string]: {
      subject: string;
      enabled: boolean;
    };
  };
}

interface PaymentSettings {
  razorpay: {
    enabled: boolean;
    keyId: string;
    keySecret: string;
    webhookSecret: string;
  };
  stripe: {
    enabled: boolean;
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
  };
  paypal: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    mode: string;
  };
  cod: {
    enabled: boolean;
    maxAmount: number;
    instructions: string;
  };
}

interface ShippingSettings {
  freeShippingThreshold: number;
  standardShippingCost: number;
  expressShippingCost: number;
  internationalShipping: boolean;
  estimatedDeliveryDays: {
    domestic: number;
    international: number;
  };
  shiprocket: {
    enabled: boolean;
    email: string;
    password: string;
    channelId: string;
  };
}

interface TaxSettings {
  gstEnabled: boolean;
  gstNumber: string;
  gstPercentage: number;
  internationalTaxEnabled: boolean;
  internationalTaxPercentage: number;
}

interface FeaturesSettings {
  reviews: boolean;
  wishlist: boolean;
  compareProducts: boolean;
  socialLogin: boolean;
  guestCheckout: boolean;
  multiVendor: boolean;
  chatSupport: boolean;
  newsletter: boolean;
}

interface MaintenanceSettings {
  enabled: boolean;
  message: string;
  allowedIPs: string[];
}

interface SEOSettings {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  googleAnalyticsId: string;
  facebookPixelId: string;
  googleTagManagerId: string;
}

interface SocialSettings {
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  whatsapp: string;
}

interface Breadcrumb {
  label: string;
  href: string;
  active?: boolean;
}

interface SettingsManagementProps {
  title?: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
}

export default function SettingsManagement({
  title = "Settings Management",
  description = "Manage site settings, payment gateways, and configurations",
  breadcrumbs,
}: SettingsManagementProps) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [alert, setAlert] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({ show: false, message: "", type: "info" });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/settings");
      if (response) {
        setSettings(response);
      }
    } catch (error: any) {
      setAlert({
        show: true,
        message: error.message || "Failed to load settings",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (section: string) => {
    if (!settings) return;

    try {
      setSaving(true);
      await apiClient.put("/admin/settings", {
        section,
        data: settings[section as keyof Settings],
      });
      setAlert({
        show: true,
        message: `${section} settings saved successfully`,
        type: "success",
      });
    } catch (error: any) {
      setAlert({
        show: true,
        message: error.message || "Failed to save settings",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (section: string, field: string, value: any) => {
    if (!settings) return;
    const currentSection = settings[section as keyof Settings];
    if (typeof currentSection === "object" && currentSection !== null) {
      setSettings({
        ...settings,
        [section]: {
          ...currentSection,
          [field]: value,
        },
      });
    }
  };

  const updateNestedSettings = (
    section: string,
    subsection: string,
    field: string,
    value: any
  ) => {
    if (!settings) return;
    const currentSection = settings[section as keyof Settings];
    if (typeof currentSection === "object" && currentSection !== null) {
      const currentSubsection = (currentSection as any)[subsection];
      if (typeof currentSubsection === "object" && currentSubsection !== null) {
        setSettings({
          ...settings,
          [section]: {
            ...currentSection,
            [subsection]: {
              ...currentSubsection,
              [field]: value,
            },
          },
        });
      }
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: <Globe className="w-4 h-4" /> },
    { id: "email", label: "Email", icon: <Mail className="w-4 h-4" /> },
    {
      id: "payment",
      label: "Payment",
      icon: <CreditCard className="w-4 h-4" />,
    },
    { id: "shipping", label: "Shipping", icon: <Truck className="w-4 h-4" /> },
    { id: "tax", label: "Tax", icon: <Receipt className="w-4 h-4" /> },
    {
      id: "features",
      label: "Features",
      icon: <ToggleLeft className="w-4 h-4" />,
    },
    {
      id: "maintenance",
      label: "Maintenance",
      icon: <Wrench className="w-4 h-4" />,
    },
    { id: "seo", label: "SEO", icon: <SearchIcon className="w-4 h-4" /> },
    { id: "social", label: "Social", icon: <Share2 className="w-4 h-4" /> },
  ];

  if (loading || !settings) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-gray-200 dark:bg-gray-700 rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        actions={
          <UnifiedButton
            onClick={fetchSettings}
            icon={<RefreshCw className="w-5 h-5" />}
            variant="outline"
          >
            Refresh
          </UnifiedButton>
        }
      />

      {alert.show && (
        <UnifiedAlert
          variant={alert.type}
          onClose={() => setAlert({ ...alert, show: false })}
          className="mb-6"
        >
          {alert.message}
        </UnifiedAlert>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <SimpleTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* General Settings */}
      {activeTab === "general" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            General Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={settings.general.siteName}
                onChange={(e) =>
                  updateSettings("general", "siteName", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Site URL
              </label>
              <input
                type="url"
                value={settings.general.siteUrl}
                onChange={(e) =>
                  updateSettings("general", "siteUrl", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Site Description
              </label>
              <textarea
                value={settings.general.siteDescription}
                onChange={(e) =>
                  updateSettings("general", "siteDescription", e.target.value)
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={settings.general.contactEmail}
                onChange={(e) =>
                  updateSettings("general", "contactEmail", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Support Email
              </label>
              <input
                type="email"
                value={settings.general.supportEmail}
                onChange={(e) =>
                  updateSettings("general", "supportEmail", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={settings.general.phoneNumber}
                onChange={(e) =>
                  updateSettings("general", "phoneNumber", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Currency
              </label>
              <select
                value={settings.general.currency}
                onChange={(e) =>
                  updateSettings("general", "currency", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
          <div className="mt-6">
            <UnifiedButton
              onClick={() => handleSave("general")}
              loading={saving}
              icon={<Save className="w-5 h-5" />}
            >
              Save General Settings
            </UnifiedButton>
          </div>
        </div>
      )}

      {/* Payment Settings */}
      {activeTab === "payment" && (
        <div className="space-y-6">
          {/* Razorpay */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Razorpay (India)
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.payment.razorpay.enabled}
                  onChange={(e) =>
                    updateNestedSettings(
                      "payment",
                      "razorpay",
                      "enabled",
                      e.target.checked
                    )
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Key ID
                </label>
                <input
                  type="text"
                  value={settings.payment.razorpay.keyId}
                  onChange={(e) =>
                    updateNestedSettings(
                      "payment",
                      "razorpay",
                      "keyId",
                      e.target.value
                    )
                  }
                  placeholder="rzp_test_..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Key Secret
                </label>
                <input
                  type="password"
                  value={settings.payment.razorpay.keySecret}
                  onChange={(e) =>
                    updateNestedSettings(
                      "payment",
                      "razorpay",
                      "keySecret",
                      e.target.value
                    )
                  }
                  placeholder="Enter key secret"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Webhook Secret
                </label>
                <input
                  type="password"
                  value={settings.payment.razorpay.webhookSecret}
                  onChange={(e) =>
                    updateNestedSettings(
                      "payment",
                      "razorpay",
                      "webhookSecret",
                      e.target.value
                    )
                  }
                  placeholder="Enter webhook secret"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Stripe */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Stripe (International)
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.payment.stripe.enabled}
                  onChange={(e) =>
                    updateNestedSettings(
                      "payment",
                      "stripe",
                      "enabled",
                      e.target.checked
                    )
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Publishable Key
                </label>
                <input
                  type="text"
                  value={settings.payment.stripe.publishableKey}
                  onChange={(e) =>
                    updateNestedSettings(
                      "payment",
                      "stripe",
                      "publishableKey",
                      e.target.value
                    )
                  }
                  placeholder="pk_test_..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Secret Key
                </label>
                <input
                  type="password"
                  value={settings.payment.stripe.secretKey}
                  onChange={(e) =>
                    updateNestedSettings(
                      "payment",
                      "stripe",
                      "secretKey",
                      e.target.value
                    )
                  }
                  placeholder="sk_test_..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Cash on Delivery */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Cash on Delivery (COD)
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.payment.cod.enabled}
                  onChange={(e) =>
                    updateNestedSettings(
                      "payment",
                      "cod",
                      "enabled",
                      e.target.checked
                    )
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maximum Amount (₹)
                </label>
                <input
                  type="number"
                  value={settings.payment.cod.maxAmount}
                  onChange={(e) =>
                    updateNestedSettings(
                      "payment",
                      "cod",
                      "maxAmount",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Instructions
                </label>
                <textarea
                  value={settings.payment.cod.instructions}
                  onChange={(e) =>
                    updateNestedSettings(
                      "payment",
                      "cod",
                      "instructions",
                      e.target.value
                    )
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <UnifiedButton
              onClick={() => handleSave("payment")}
              loading={saving}
              icon={<Save className="w-5 h-5" />}
            >
              Save Payment Settings
            </UnifiedButton>
          </div>
        </div>
      )}

      {/* Add other tabs here (Email, Shipping, Tax, Features, etc.) */}
      {activeTab === "email" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Email Settings (Coming Soon)
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Email configuration will be available in the next update.
          </p>
        </div>
      )}

      {activeTab === "shipping" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Shipping Settings (Coming Soon)
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Shipping configuration will be available in the next update.
          </p>
        </div>
      )}

      {activeTab === "tax" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Tax Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="gstEnabled"
                checked={settings.tax.gstEnabled}
                onChange={(e) =>
                  updateSettings("tax", "gstEnabled", e.target.checked)
                }
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="gstEnabled"
                className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Enable GST
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                GST Number
              </label>
              <input
                type="text"
                value={settings.tax.gstNumber}
                onChange={(e) =>
                  updateSettings("tax", "gstNumber", e.target.value)
                }
                placeholder="Enter GST number"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                GST Percentage
              </label>
              <input
                type="number"
                value={settings.tax.gstPercentage}
                onChange={(e) =>
                  updateSettings(
                    "tax",
                    "gstPercentage",
                    parseFloat(e.target.value)
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-6">
            <UnifiedButton
              onClick={() => handleSave("tax")}
              loading={saving}
              icon={<Save className="w-5 h-5" />}
            >
              Save Tax Settings
            </UnifiedButton>
          </div>
        </div>
      )}

      {activeTab === "features" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Feature Toggles (Coming Soon)
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Feature toggles will be available in the next update.
          </p>
        </div>
      )}

      {activeTab === "maintenance" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Maintenance Mode (Coming Soon)
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Maintenance mode configuration will be available in the next update.
          </p>
        </div>
      )}

      {activeTab === "seo" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            SEO Settings (Coming Soon)
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            SEO configuration will be available in the next update.
          </p>
        </div>
      )}

      {activeTab === "social" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Social Media Links (Coming Soon)
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Social media configuration will be available in the next update.
          </p>
        </div>
      )}
    </div>
  );
}
