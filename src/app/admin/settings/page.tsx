"use client";

import { useState, useEffect } from "react";

import {
  CogIcon,
  CreditCardIcon,
  PhotoIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  phoneNumber: string;
  address: string;
  isLive: boolean;
  maintenanceMessage: string;
  currency: string;
  taxRate: number;
  shippingCost: number;
  homePageSections: HomePageSection[];
  heroImages: string[];
  policies: {
    privacy: string;
    terms: string;
    returnPolicy: string;
    shippingPolicy: string;
  };
  paymentSettings: {
    stripeEnabled: boolean;
    paypalEnabled: boolean;
    codEnabled: boolean;
    stripePublicKey: string;
    paypalClientId: string;
  };
  firebaseConfig: {
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}

interface HomePageSection {
  id: string;
  type:
    | "hero"
    | "features"
    | "categories"
    | "featured-products"
    | "auctions"
    | "newsletter";
  title: string;
  enabled: boolean;
  order: number;
  content?: any;
}

export default function SettingsManagement() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        // Show success message
        alert("Settings saved successfully!");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (path: string, value: any) => {
    if (!settings) return;

    const keys = path.split(".");
    const newSettings = { ...settings };
    let current: any = newSettings;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setSettings(newSettings);
  };

  const tabs = [
    { id: "general", name: "General", icon: CogIcon },
    { id: "payments", name: "Payments", icon: CreditCardIcon },
    { id: "homepage", name: "Home Page", icon: PhotoIcon },
    { id: "policies", name: "Policies", icon: DocumentTextIcon },
    { id: "firebase", name: "Firebase", icon: ShieldCheckIcon },
  ];

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-500">Failed to load settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Site Settings
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Configure your website settings and preferences
              </p>
            </div>
            <button
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <ShieldCheckIcon className="h-5 w-5" />
              )}
              <span>{saving ? "Saving..." : "Save Settings"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? "bg-red-50 text-red-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {/* General Settings */}
              {activeTab === "general" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    General Settings
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Site Name
                      </label>
                      <input
                        type="text"
                        value={settings.siteName}
                        onChange={(e) =>
                          updateSettings("siteName", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={settings.contactEmail}
                        onChange={(e) =>
                          updateSettings("contactEmail", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={settings.phoneNumber}
                        onChange={(e) =>
                          updateSettings("phoneNumber", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select
                        value={settings.currency}
                        onChange={(e) =>
                          updateSettings("currency", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="INR">INR (₹)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Description
                    </label>
                    <textarea
                      value={settings.siteDescription}
                      onChange={(e) =>
                        updateSettings("siteDescription", e.target.value)
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      value={settings.address}
                      onChange={(e) =>
                        updateSettings("address", e.target.value)
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Site Status
                        </h4>
                        <p className="text-sm text-gray-500">
                          Control whether your site is live or in maintenance
                          mode
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          updateSettings("isLive", !settings.isLive)
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.isLive ? "bg-green-600" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.isLive ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    {!settings.isLive && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maintenance Message
                        </label>
                        <textarea
                          value={settings.maintenanceMessage}
                          onChange={(e) =>
                            updateSettings("maintenanceMessage", e.target.value)
                          }
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="We're currently performing scheduled maintenance. Please check back soon!"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Settings */}
              {activeTab === "payments" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Payment Settings
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CreditCardIcon className="h-6 w-6 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">Stripe</h4>
                          <p className="text-sm text-gray-500">
                            Credit card payments
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          updateSettings(
                            "paymentSettings.stripeEnabled",
                            !settings.paymentSettings.stripeEnabled
                          )
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.paymentSettings.stripeEnabled
                            ? "bg-green-600"
                            : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.paymentSettings.stripeEnabled
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    {settings.paymentSettings.stripeEnabled && (
                      <div className="ml-9">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stripe Public Key
                        </label>
                        <input
                          type="text"
                          value={settings.paymentSettings.stripePublicKey}
                          onChange={(e) =>
                            updateSettings(
                              "paymentSettings.stripePublicKey",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="pk_..."
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CreditCardIcon className="h-6 w-6 text-yellow-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">PayPal</h4>
                          <p className="text-sm text-gray-500">
                            PayPal payments
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          updateSettings(
                            "paymentSettings.paypalEnabled",
                            !settings.paymentSettings.paypalEnabled
                          )
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.paymentSettings.paypalEnabled
                            ? "bg-green-600"
                            : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.paymentSettings.paypalEnabled
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CreditCardIcon className="h-6 w-6 text-green-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Cash on Delivery
                          </h4>
                          <p className="text-sm text-gray-500">
                            Pay when product is delivered
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          updateSettings(
                            "paymentSettings.codEnabled",
                            !settings.paymentSettings.codEnabled
                          )
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.paymentSettings.codEnabled
                            ? "bg-green-600"
                            : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.paymentSettings.codEnabled
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tax Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={settings.taxRate}
                        onChange={(e) =>
                          updateSettings(
                            "taxRate",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Shipping Cost
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={settings.shippingCost}
                        onChange={(e) =>
                          updateSettings(
                            "shippingCost",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Homepage Settings */}
              {activeTab === "homepage" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Home Page Sections
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Configure which sections appear on your homepage and their
                    order
                  </p>

                  {settings.homePageSections && (
                    <div className="space-y-4">
                      {settings.homePageSections
                        .sort((a, b) => a.order - b.order)
                        .map((section, index) => (
                          <div
                            key={section.id}
                            className="bg-gray-50 rounded-lg p-4 border"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-500">
                                    #{section.order}
                                  </span>
                                  <h4 className="font-medium text-gray-900">
                                    {section.title}
                                  </h4>
                                </div>
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                  {section.type}
                                </span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() => {
                                    const newSections = [
                                      ...settings.homePageSections,
                                    ];
                                    newSections[
                                      newSections.findIndex(
                                        (s) => s.id === section.id
                                      )
                                    ].enabled = !section.enabled;
                                    updateSettings(
                                      "homePageSections",
                                      newSections
                                    );
                                  }}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    section.enabled
                                      ? "bg-green-600"
                                      : "bg-gray-200"
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                      section.enabled
                                        ? "translate-x-6"
                                        : "translate-x-1"
                                    }`}
                                  />
                                </button>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => {
                                      if (index === 0) return;
                                      const newSections = [
                                        ...settings.homePageSections,
                                      ];
                                      const currentIndex =
                                        newSections.findIndex(
                                          (s) => s.id === section.id
                                        );
                                      const prevIndex = currentIndex - 1;
                                      [
                                        newSections[currentIndex].order,
                                        newSections[prevIndex].order,
                                      ] = [
                                        newSections[prevIndex].order,
                                        newSections[currentIndex].order,
                                      ];
                                      updateSettings(
                                        "homePageSections",
                                        newSections
                                      );
                                    }}
                                    disabled={index === 0}
                                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                  >
                                    ↑
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (
                                        index ===
                                        settings.homePageSections.length - 1
                                      )
                                        return;
                                      const newSections = [
                                        ...settings.homePageSections,
                                      ];
                                      const currentIndex =
                                        newSections.findIndex(
                                          (s) => s.id === section.id
                                        );
                                      const nextIndex = currentIndex + 1;
                                      [
                                        newSections[currentIndex].order,
                                        newSections[nextIndex].order,
                                      ] = [
                                        newSections[nextIndex].order,
                                        newSections[currentIndex].order,
                                      ];
                                      updateSettings(
                                        "homePageSections",
                                        newSections
                                      );
                                    }}
                                    disabled={
                                      index ===
                                      settings.homePageSections.length - 1
                                    }
                                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                  >
                                    ↓
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Section-specific settings */}
                            {section.type === "hero" && section.content && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Main Banner Title
                                  </label>
                                  <input
                                    type="text"
                                    value={
                                      section.content.mainBanner?.title || ""
                                    }
                                    onChange={(e) => {
                                      const newSections = [
                                        ...settings.homePageSections,
                                      ];
                                      const sectionIndex =
                                        newSections.findIndex(
                                          (s) => s.id === section.id
                                        );
                                      if (
                                        !newSections[sectionIndex].content
                                          .mainBanner
                                      ) {
                                        newSections[
                                          sectionIndex
                                        ].content.mainBanner = {};
                                      }
                                      newSections[
                                        sectionIndex
                                      ].content.mainBanner.title =
                                        e.target.value;
                                      updateSettings(
                                        "homePageSections",
                                        newSections
                                      );
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Side Banner Title
                                  </label>
                                  <input
                                    type="text"
                                    value={
                                      section.content.sideBanner?.title || ""
                                    }
                                    onChange={(e) => {
                                      const newSections = [
                                        ...settings.homePageSections,
                                      ];
                                      const sectionIndex =
                                        newSections.findIndex(
                                          (s) => s.id === section.id
                                        );
                                      if (
                                        !newSections[sectionIndex].content
                                          .sideBanner
                                      ) {
                                        newSections[
                                          sectionIndex
                                        ].content.sideBanner = {};
                                      }
                                      newSections[
                                        sectionIndex
                                      ].content.sideBanner.title =
                                        e.target.value;
                                      updateSettings(
                                        "homePageSections",
                                        newSections
                                      );
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                  />
                                </div>
                              </div>
                            )}

                            {section.type === "featured-products" &&
                              section.content && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Display Type
                                    </label>
                                    <select
                                      value={
                                        section.content.type || "most-visited"
                                      }
                                      onChange={(e) => {
                                        const newSections = [
                                          ...settings.homePageSections,
                                        ];
                                        const sectionIndex =
                                          newSections.findIndex(
                                            (s) => s.id === section.id
                                          );
                                        newSections[sectionIndex].content.type =
                                          e.target.value;
                                        updateSettings(
                                          "homePageSections",
                                          newSections
                                        );
                                      }}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    >
                                      <option value="most-visited">
                                        Most Visited
                                      </option>
                                      <option value="wishlisted">
                                        Most Wishlisted
                                      </option>
                                      <option value="newest">
                                        Newest Products
                                      </option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Number of Products
                                    </label>
                                    <input
                                      type="number"
                                      min="4"
                                      max="12"
                                      value={section.content.limit || 8}
                                      onChange={(e) => {
                                        const newSections = [
                                          ...settings.homePageSections,
                                        ];
                                        const sectionIndex =
                                          newSections.findIndex(
                                            (s) => s.id === section.id
                                          );
                                        newSections[
                                          sectionIndex
                                        ].content.limit = parseInt(
                                          e.target.value
                                        );
                                        updateSettings(
                                          "homePageSections",
                                          newSections
                                        );
                                      }}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                  </div>
                                </div>
                              )}

                            {section.type === "auctions" && section.content && (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id={`show-live-${section.id}`}
                                    checked={section.content.showLive !== false}
                                    onChange={(e) => {
                                      const newSections = [
                                        ...settings.homePageSections,
                                      ];
                                      const sectionIndex =
                                        newSections.findIndex(
                                          (s) => s.id === section.id
                                        );
                                      newSections[
                                        sectionIndex
                                      ].content.showLive = e.target.checked;
                                      updateSettings(
                                        "homePageSections",
                                        newSections
                                      );
                                    }}
                                    className="mr-2"
                                  />
                                  <label
                                    htmlFor={`show-live-${section.id}`}
                                    className="text-sm text-gray-700"
                                  >
                                    Show Live Auctions
                                  </label>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id={`show-closed-${section.id}`}
                                    checked={
                                      section.content.showClosed !== false
                                    }
                                    onChange={(e) => {
                                      const newSections = [
                                        ...settings.homePageSections,
                                      ];
                                      const sectionIndex =
                                        newSections.findIndex(
                                          (s) => s.id === section.id
                                        );
                                      newSections[
                                        sectionIndex
                                      ].content.showClosed = e.target.checked;
                                      updateSettings(
                                        "homePageSections",
                                        newSections
                                      );
                                    }}
                                    className="mr-2"
                                  />
                                  <label
                                    htmlFor={`show-closed-${section.id}`}
                                    className="text-sm text-gray-700"
                                  >
                                    Show Closed Auctions
                                  </label>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Max Auctions
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="6"
                                    value={section.content.limit || 3}
                                    onChange={(e) => {
                                      const newSections = [
                                        ...settings.homePageSections,
                                      ];
                                      const sectionIndex =
                                        newSections.findIndex(
                                          (s) => s.id === section.id
                                        );
                                      newSections[sectionIndex].content.limit =
                                        parseInt(e.target.value);
                                      updateSettings(
                                        "homePageSections",
                                        newSections
                                      );
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "policies" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Legal Policies
                  </h3>
                  <div className="text-center py-12 text-gray-500">
                    <DocumentTextIcon className="h-12 w-12 mx-auto mb-4" />
                    <p>Policy management coming soon...</p>
                    <p className="text-sm">
                      Manage privacy policy, terms of service, and return policy
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "firebase" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Firebase Configuration
                  </h3>
                  <div className="text-center py-12 text-gray-500">
                    <ShieldCheckIcon className="h-12 w-12 mx-auto mb-4" />
                    <p>Firebase settings coming soon...</p>
                    <p className="text-sm">
                      Configure Firebase project settings and storage
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
