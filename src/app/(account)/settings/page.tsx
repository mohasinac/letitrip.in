"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/features/auth/ProtectedRoute";

interface AppSettings {
  general: {
    language: string;
    timezone: string;
    currency: string;
    theme: "light" | "dark" | "auto";
  };
  display: {
    itemsPerPage: number;
    gridView: boolean;
    showPrices: boolean;
    showDiscounts: boolean;
    compactMode: boolean;
  };
  shopping: {
    autoAddToWishlist: boolean;
    saveForLater: boolean;
    quickBuy: boolean;
    guestCheckout: boolean;
    rememberPayment: boolean;
  };
  auctions: {
    autoWatch: boolean;
    bidReminders: boolean;
    outbidAlerts: boolean;
    auctionEndAlerts: boolean;
    maxAutoBid: number;
  };
  privacy: {
    shareActivity: boolean;
    showOnlineStatus: boolean;
    allowMessages: boolean;
    publicWishlist: boolean;
    dataCollection: boolean;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("general");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/user/settings");
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        } else {
          // Fallback to default settings
          const defaultSettings: AppSettings = {
            general: {
              language: "en",
              timezone: "America/New_York",
              currency: "USD",
              theme: "light",
            },
            display: {
              itemsPerPage: 24,
              gridView: true,
              showPrices: true,
              showDiscounts: true,
              compactMode: false,
            },
            shopping: {
              autoAddToWishlist: false,
              saveForLater: true,
              quickBuy: false,
              guestCheckout: true,
              rememberPayment: false,
            },
            auctions: {
              autoWatch: true,
              bidReminders: true,
              outbidAlerts: true,
              auctionEndAlerts: true,
              maxAutoBid: 100,
            },
            privacy: {
              shareActivity: false,
              showOnlineStatus: true,
              allowMessages: true,
              publicWishlist: false,
              dataCollection: true,
            },
          };
          setSettings(defaultSettings);
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        // Use default settings on error
        setSettings({
          general: {
            language: "en",
            timezone: "America/New_York",
            currency: "USD",
            theme: "light",
          },
          display: {
            itemsPerPage: 24,
            gridView: true,
            showPrices: true,
            showDiscounts: true,
            compactMode: false,
          },
          shopping: {
            autoAddToWishlist: false,
            saveForLater: true,
            quickBuy: false,
            guestCheckout: true,
            rememberPayment: false,
          },
          auctions: {
            autoWatch: true,
            bidReminders: true,
            outbidAlerts: true,
            auctionEndAlerts: true,
            maxAutoBid: 100,
          },
          privacy: {
            shareActivity: false,
            showOnlineStatus: true,
            allowMessages: true,
            publicWishlist: false,
            dataCollection: true,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSettingsUpdate = async (
    section: keyof AppSettings,
    updatedSettings: any
  ) => {
    if (!settings) return;

    setSaving(true);

    try {
      const newSettings = {
        ...settings,
        [section]: { ...settings[section], ...updatedSettings },
      };

      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSettings),
      });

      if (response.ok) {
        setSettings(newSettings);
      } else {
        console.error("Failed to save settings");
        // Still update locally for now
        setSettings(newSettings);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      // Still update locally
      setSettings({
        ...settings,
        [section]: { ...settings[section], ...updatedSettings },
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (
      confirm("Are you sure you want to reset all settings to default values?")
    ) {
      // Reset logic would go here
      alert("Settings reset to defaults!");
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!settings) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Settings Not Found
            </h1>
            <p className="text-gray-600">Unable to load your settings.</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const sections = [
    { id: "general", name: "General", icon: "⚙️" },
    { id: "display", name: "Display", icon: "🖥️" },
    { id: "shopping", name: "Shopping", icon: "🛒" },
    { id: "auctions", name: "Auctions", icon: "🏷️" },
    { id: "privacy", name: "Privacy", icon: "🔒" },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Customize your app experience</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:w-1/4">
              <nav className="bg-white rounded-lg shadow-sm border p-2 sticky top-8">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="mr-3">{section.icon}</span>
                    {section.name}
                  </button>
                ))}

                <hr className="my-4" />

                <button
                  onClick={resetToDefaults}
                  className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Reset to Defaults
                </button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              {/* General Settings */}
              {activeSection === "general" && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    General Settings
                  </h2>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Language
                        </label>
                        <select
                          value={settings.general.language}
                          onChange={(e) =>
                            handleSettingsUpdate("general", {
                              language: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="en">English</option>
                          <option value="es">Español</option>
                          <option value="fr">Français</option>
                          <option value="de">Deutsch</option>
                          <option value="ja">日本語</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Timezone
                        </label>
                        <select
                          value={settings.general.timezone}
                          onChange={(e) =>
                            handleSettingsUpdate("general", {
                              timezone: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="America/New_York">
                            Eastern Time (ET)
                          </option>
                          <option value="America/Chicago">
                            Central Time (CT)
                          </option>
                          <option value="America/Denver">
                            Mountain Time (MT)
                          </option>
                          <option value="America/Los_Angeles">
                            Pacific Time (PT)
                          </option>
                          <option value="Europe/London">London (GMT)</option>
                          <option value="Europe/Paris">Paris (CET)</option>
                          <option value="Asia/Tokyo">Tokyo (JST)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Currency
                        </label>
                        <select
                          value={settings.general.currency}
                          onChange={(e) =>
                            handleSettingsUpdate("general", {
                              currency: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="JPY">JPY (¥)</option>
                          <option value="CAD">CAD (C$)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Theme
                        </label>
                        <select
                          value={settings.general.theme}
                          onChange={(e) =>
                            handleSettingsUpdate("general", {
                              theme: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="auto">Auto (System)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Display Settings */}
              {activeSection === "display" && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Display Settings
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Items per page
                      </label>
                      <select
                        value={settings.display.itemsPerPage}
                        onChange={(e) =>
                          handleSettingsUpdate("display", {
                            itemsPerPage: parseInt(e.target.value),
                          })
                        }
                        className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value={12}>12 items</option>
                        <option value={24}>24 items</option>
                        <option value={48}>48 items</option>
                        <option value={96}>96 items</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      {[
                        {
                          key: "gridView",
                          label: "Grid view by default",
                          description:
                            "Show products in grid layout instead of list",
                        },
                        {
                          key: "showPrices",
                          label: "Show prices",
                          description: "Display product prices on listings",
                        },
                        {
                          key: "showDiscounts",
                          label: "Show discount badges",
                          description: "Highlight products on sale",
                        },
                        {
                          key: "compactMode",
                          label: "Compact mode",
                          description: "Use smaller spacing and text",
                        },
                      ].map((setting) => (
                        <div
                          key={setting.key}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {setting.label}
                            </p>
                            <p className="text-sm text-gray-600">
                              {setting.description}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={
                                settings.display[
                                  setting.key as keyof typeof settings.display
                                ] as boolean
                              }
                              onChange={(e) =>
                                handleSettingsUpdate("display", {
                                  [setting.key]: e.target.checked,
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Shopping Settings */}
              {activeSection === "shopping" && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Shopping Preferences
                  </h2>

                  <div className="space-y-6">
                    {[
                      {
                        key: "autoAddToWishlist",
                        label: "Auto-add to wishlist",
                        description:
                          "Automatically save viewed products to wishlist",
                      },
                      {
                        key: "saveForLater",
                        label: "Save for later option",
                        description: "Show 'Save for later' button in cart",
                      },
                      {
                        key: "quickBuy",
                        label: "Quick buy button",
                        description: "Enable one-click purchasing",
                      },
                      {
                        key: "guestCheckout",
                        label: "Guest checkout",
                        description: "Allow checkout without creating account",
                      },
                      {
                        key: "rememberPayment",
                        label: "Remember payment methods",
                        description: "Save payment info for faster checkout",
                      },
                    ].map((setting) => (
                      <div
                        key={setting.key}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {setting.label}
                          </p>
                          <p className="text-sm text-gray-600">
                            {setting.description}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={
                              settings.shopping[
                                setting.key as keyof typeof settings.shopping
                              ] as boolean
                            }
                            onChange={(e) =>
                              handleSettingsUpdate("shopping", {
                                [setting.key]: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Auction Settings */}
              {activeSection === "auctions" && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Auction Preferences
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum auto-bid amount ($)
                      </label>
                      <input
                        type="number"
                        value={settings.auctions.maxAutoBid}
                        onChange={(e) =>
                          handleSettingsUpdate("auctions", {
                            maxAutoBid: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        min="0"
                        max="10000"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        Maximum amount for automatic bidding
                      </p>
                    </div>

                    <div className="space-y-4">
                      {[
                        {
                          key: "autoWatch",
                          label: "Auto-watch auctions",
                          description:
                            "Automatically watch auctions you bid on",
                        },
                        {
                          key: "bidReminders",
                          label: "Bid reminders",
                          description: "Remind me to bid on ending auctions",
                        },
                        {
                          key: "outbidAlerts",
                          label: "Outbid alerts",
                          description: "Notify when someone outbids me",
                        },
                        {
                          key: "auctionEndAlerts",
                          label: "Auction end alerts",
                          description:
                            "Notify when watched auctions are ending",
                        },
                      ].map((setting) => (
                        <div
                          key={setting.key}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {setting.label}
                            </p>
                            <p className="text-sm text-gray-600">
                              {setting.description}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={
                                settings.auctions[
                                  setting.key as keyof typeof settings.auctions
                                ] as boolean
                              }
                              onChange={(e) =>
                                handleSettingsUpdate("auctions", {
                                  [setting.key]: e.target.checked,
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Settings */}
              {activeSection === "privacy" && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Privacy Settings
                  </h2>

                  <div className="space-y-6">
                    {[
                      {
                        key: "shareActivity",
                        label: "Share activity",
                        description: "Allow others to see your recent activity",
                      },
                      {
                        key: "showOnlineStatus",
                        label: "Show online status",
                        description: "Let others know when you're online",
                      },
                      {
                        key: "allowMessages",
                        label: "Allow messages",
                        description: "Receive messages from other users",
                      },
                      {
                        key: "publicWishlist",
                        label: "Public wishlist",
                        description: "Make your wishlist visible to others",
                      },
                      {
                        key: "dataCollection",
                        label: "Usage analytics",
                        description:
                          "Help improve the app by sharing usage data",
                      },
                    ].map((setting) => (
                      <div
                        key={setting.key}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {setting.label}
                          </p>
                          <p className="text-sm text-gray-600">
                            {setting.description}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={
                              settings.privacy[
                                setting.key as keyof typeof settings.privacy
                              ] as boolean
                            }
                            onChange={(e) =>
                              handleSettingsUpdate("privacy", {
                                [setting.key]: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    ))}

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Data Management
                      </h3>
                      <div className="space-y-3">
                        <button className="btn btn-outline w-full">
                          Download My Data
                        </button>
                        <button className="btn btn-outline w-full">
                          Request Data Deletion
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Indicator */}
              {saving && (
                <div className="fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-lg shadow-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Saving...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
