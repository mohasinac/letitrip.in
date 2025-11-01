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

      {/* Email Settings */}
      {activeTab === "email" && (
        <div className="space-y-6">
          {/* SMTP Configuration */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              SMTP Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={settings.email.smtpHost}
                  onChange={(e) =>
                    updateSettings("email", "smtpHost", e.target.value)
                  }
                  placeholder="smtp.gmail.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={settings.email.smtpPort}
                  onChange={(e) =>
                    updateSettings(
                      "email",
                      "smtpPort",
                      parseInt(e.target.value)
                    )
                  }
                  placeholder="587"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SMTP Username
                </label>
                <input
                  type="text"
                  value={settings.email.smtpUser}
                  onChange={(e) =>
                    updateSettings("email", "smtpUser", e.target.value)
                  }
                  placeholder="your-email@gmail.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SMTP Password
                </label>
                <input
                  type="password"
                  value={settings.email.smtpPassword}
                  onChange={(e) =>
                    updateSettings("email", "smtpPassword", e.target.value)
                  }
                  placeholder="App password"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  From Email
                </label>
                <input
                  type="email"
                  value={settings.email.fromEmail}
                  onChange={(e) =>
                    updateSettings("email", "fromEmail", e.target.value)
                  }
                  placeholder="noreply@justforview.in"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  From Name
                </label>
                <input
                  type="text"
                  value={settings.email.fromName}
                  onChange={(e) =>
                    updateSettings("email", "fromName", e.target.value)
                  }
                  placeholder="JustForView"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Email Templates */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Email Templates
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Available variables:{" "}
              <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {"{{orderNumber}}"}
              </code>{" "}
              <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {"{{siteName}}"}
              </code>
            </p>
            <div className="space-y-4">
              {Object.entries(settings.email.templates).map(
                ([key, template]) => (
                  <div
                    key={key}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </h4>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={template.enabled}
                          onChange={(e) => {
                            const newTemplates = {
                              ...settings.email.templates,
                            };
                            newTemplates[key].enabled = e.target.checked;
                            updateSettings("email", "templates", newTemplates);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={template.subject}
                      onChange={(e) => {
                        const newTemplates = { ...settings.email.templates };
                        newTemplates[key].subject = e.target.value;
                        updateSettings("email", "templates", newTemplates);
                      }}
                      placeholder="Email subject"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )
              )}
            </div>
          </div>

          <div>
            <UnifiedButton
              onClick={() => handleSave("email")}
              loading={saving}
              icon={<Save className="w-5 h-5" />}
            >
              Save Email Settings
            </UnifiedButton>
          </div>
        </div>
      )}

      {/* Shipping Settings */}
      {activeTab === "shipping" && (
        <div className="space-y-6">
          {/* Shipping Costs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Shipping Costs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Free Shipping Threshold (₹)
                </label>
                <input
                  type="number"
                  value={settings.shipping.freeShippingThreshold}
                  onChange={(e) =>
                    updateSettings(
                      "shipping",
                      "freeShippingThreshold",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Standard Shipping Cost (₹)
                </label>
                <input
                  type="number"
                  value={settings.shipping.standardShippingCost}
                  onChange={(e) =>
                    updateSettings(
                      "shipping",
                      "standardShippingCost",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Express Shipping Cost (₹)
                </label>
                <input
                  type="number"
                  value={settings.shipping.expressShippingCost}
                  onChange={(e) =>
                    updateSettings(
                      "shipping",
                      "expressShippingCost",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="internationalShipping"
                  checked={settings.shipping.internationalShipping}
                  onChange={(e) =>
                    updateSettings(
                      "shipping",
                      "internationalShipping",
                      e.target.checked
                    )
                  }
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="internationalShipping"
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Enable International Shipping
                </label>
              </div>
            </div>
          </div>

          {/* Delivery Times */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Estimated Delivery Days
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Domestic Delivery (days)
                </label>
                <input
                  type="number"
                  value={settings.shipping.estimatedDeliveryDays.domestic}
                  onChange={(e) =>
                    updateNestedSettings(
                      "shipping",
                      "estimatedDeliveryDays",
                      "domestic",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  International Delivery (days)
                </label>
                <input
                  type="number"
                  value={settings.shipping.estimatedDeliveryDays.international}
                  onChange={(e) =>
                    updateNestedSettings(
                      "shipping",
                      "estimatedDeliveryDays",
                      "international",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Shiprocket Integration */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Shiprocket Integration (India)
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.shipping.shiprocket.enabled}
                  onChange={(e) =>
                    updateNestedSettings(
                      "shipping",
                      "shiprocket",
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
                  Shiprocket Email
                </label>
                <input
                  type="email"
                  value={settings.shipping.shiprocket.email}
                  onChange={(e) =>
                    updateNestedSettings(
                      "shipping",
                      "shiprocket",
                      "email",
                      e.target.value
                    )
                  }
                  placeholder="your-email@example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Shiprocket Password
                </label>
                <input
                  type="password"
                  value={settings.shipping.shiprocket.password}
                  onChange={(e) =>
                    updateNestedSettings(
                      "shipping",
                      "shiprocket",
                      "password",
                      e.target.value
                    )
                  }
                  placeholder="Enter password"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Channel ID
                </label>
                <input
                  type="text"
                  value={settings.shipping.shiprocket.channelId}
                  onChange={(e) =>
                    updateNestedSettings(
                      "shipping",
                      "shiprocket",
                      "channelId",
                      e.target.value
                    )
                  }
                  placeholder="Enter channel ID"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <UnifiedButton
              onClick={() => handleSave("shipping")}
              loading={saving}
              icon={<Save className="w-5 h-5" />}
            >
              Save Shipping Settings
            </UnifiedButton>
          </div>
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

      {/* Features Toggles */}
      {activeTab === "features" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Feature Toggles
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Enable or disable features across your platform
          </p>
          <div className="space-y-4">
            {Object.entries(settings.features).map(([key, enabled]) => (
              <div
                key={key}
                className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {key === "reviews" &&
                      "Allow customers to leave product reviews"}
                    {key === "wishlist" &&
                      "Enable wishlist functionality for users"}
                    {key === "compareProducts" &&
                      "Allow product comparison feature"}
                    {key === "socialLogin" &&
                      "Enable login with social media accounts"}
                    {key === "guestCheckout" &&
                      "Allow checkout without registration"}
                    {key === "multiVendor" &&
                      "Enable multi-vendor marketplace features"}
                    {key === "chatSupport" && "Enable live chat support widget"}
                    {key === "newsletter" && "Enable newsletter subscription"}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) =>
                      updateSettings("features", key, e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <UnifiedButton
              onClick={() => handleSave("features")}
              loading={saving}
              icon={<Save className="w-5 h-5" />}
            >
              Save Feature Settings
            </UnifiedButton>
          </div>
        </div>
      )}

      {/* Maintenance Mode */}
      {activeTab === "maintenance" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Maintenance Mode
            </h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenance.enabled}
                onChange={(e) =>
                  updateSettings("maintenance", "enabled", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          {settings.maintenance.enabled && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Warning: Maintenance mode is currently enabled. Only
                whitelisted IPs can access the site.
              </p>
            </div>
          )}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maintenance Message
              </label>
              <textarea
                value={settings.maintenance.message}
                onChange={(e) =>
                  updateSettings("maintenance", "message", e.target.value)
                }
                rows={4}
                placeholder="Enter the message to display during maintenance"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Allowed IP Addresses
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Enter IP addresses that should have access during maintenance
                (one per line)
              </p>
              <textarea
                value={settings.maintenance.allowedIPs.join("\n")}
                onChange={(e) =>
                  updateSettings(
                    "maintenance",
                    "allowedIPs",
                    e.target.value.split("\n").filter((ip) => ip.trim())
                  )
                }
                rows={6}
                placeholder="192.168.1.1&#10;10.0.0.1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Tip: Add your current IP to avoid being locked out
              </p>
            </div>
          </div>
          <div className="mt-6">
            <UnifiedButton
              onClick={() => handleSave("maintenance")}
              loading={saving}
              icon={<Save className="w-5 h-5" />}
            >
              Save Maintenance Settings
            </UnifiedButton>
          </div>
        </div>
      )}

      {/* SEO Settings */}
      {activeTab === "seo" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            SEO Settings
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                value={settings.seo.metaTitle}
                onChange={(e) =>
                  updateSettings("seo", "metaTitle", e.target.value)
                }
                placeholder="Your site title"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Recommended length: 50-60 characters
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meta Description
              </label>
              <textarea
                value={settings.seo.metaDescription}
                onChange={(e) =>
                  updateSettings("seo", "metaDescription", e.target.value)
                }
                rows={3}
                placeholder="Brief description of your site"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Recommended length: 150-160 characters
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meta Keywords
              </label>
              <input
                type="text"
                value={settings.seo.metaKeywords}
                onChange={(e) =>
                  updateSettings("seo", "metaKeywords", e.target.value)
                }
                placeholder="ecommerce, online shopping, marketplace"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Comma-separated keywords
              </p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                Analytics & Tracking
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Google Analytics ID
                  </label>
                  <input
                    type="text"
                    value={settings.seo.googleAnalyticsId}
                    onChange={(e) =>
                      updateSettings("seo", "googleAnalyticsId", e.target.value)
                    }
                    placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX-X"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Facebook Pixel ID
                  </label>
                  <input
                    type="text"
                    value={settings.seo.facebookPixelId}
                    onChange={(e) =>
                      updateSettings("seo", "facebookPixelId", e.target.value)
                    }
                    placeholder="XXXXXXXXXXXXXXX"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Google Tag Manager ID
                  </label>
                  <input
                    type="text"
                    value={settings.seo.googleTagManagerId}
                    onChange={(e) =>
                      updateSettings(
                        "seo",
                        "googleTagManagerId",
                        e.target.value
                      )
                    }
                    placeholder="GTM-XXXXXXX"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <UnifiedButton
              onClick={() => handleSave("seo")}
              loading={saving}
              icon={<Save className="w-5 h-5" />}
            >
              Save SEO Settings
            </UnifiedButton>
          </div>
        </div>
      )}

      {/* Social Media Links */}
      {activeTab === "social" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Social Media Links
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Add your social media profile URLs
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Facebook
              </label>
              <input
                type="url"
                value={settings.social.facebook}
                onChange={(e) =>
                  updateSettings("social", "facebook", e.target.value)
                }
                placeholder="https://facebook.com/yourpage"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Twitter
              </label>
              <input
                type="url"
                value={settings.social.twitter}
                onChange={(e) =>
                  updateSettings("social", "twitter", e.target.value)
                }
                placeholder="https://twitter.com/yourhandle"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Instagram
              </label>
              <input
                type="url"
                value={settings.social.instagram}
                onChange={(e) =>
                  updateSettings("social", "instagram", e.target.value)
                }
                placeholder="https://instagram.com/yourhandle"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                LinkedIn
              </label>
              <input
                type="url"
                value={settings.social.linkedin}
                onChange={(e) =>
                  updateSettings("social", "linkedin", e.target.value)
                }
                placeholder="https://linkedin.com/company/yourcompany"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                YouTube
              </label>
              <input
                type="url"
                value={settings.social.youtube}
                onChange={(e) =>
                  updateSettings("social", "youtube", e.target.value)
                }
                placeholder="https://youtube.com/@yourchannel"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                WhatsApp
              </label>
              <input
                type="url"
                value={settings.social.whatsapp}
                onChange={(e) =>
                  updateSettings("social", "whatsapp", e.target.value)
                }
                placeholder="https://wa.me/919876543210"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Format: https://wa.me/[country code][phone number]
              </p>
            </div>
          </div>
          <div className="mt-6">
            <UnifiedButton
              onClick={() => handleSave("social")}
              loading={saving}
              icon={<Save className="w-5 h-5" />}
            >
              Save Social Media Links
            </UnifiedButton>
          </div>
        </div>
      )}
    </div>
  );
}
