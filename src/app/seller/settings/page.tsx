"use client";

import { useState, useEffect } from "react";
import {
  CogIcon,
  PaintBrushIcon,
  BellIcon,
  UserIcon,
  ShoppingBagIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import ThemeSettings from "@/components/ui/ThemeSettings";

export default function SellerSettings() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", name: "General", icon: CogIcon },
    { id: "theme", name: "Theme", icon: PaintBrushIcon },
    { id: "profile", name: "Profile", icon: UserIcon },
    { id: "notifications", name: "Notifications", icon: BellIcon },
    { id: "store", name: "Store", icon: ShoppingBagIcon },
    { id: "analytics", name: "Analytics", icon: ChartBarIcon },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <div className="admin-header">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-primary">
                Seller Settings
              </h1>
              <p className="mt-1 text-sm text-muted">
                Manage your seller account settings and preferences
              </p>
            </div>
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
                        ? "bg-purple-50 text-purple-700"
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
            <div className="admin-card p-6">
              {/* General Settings */}
              {activeTab === "general" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-primary">
                    General Settings
                  </h3>
                  <p className="text-secondary">
                    Configure your basic seller account settings.
                  </p>
                  <div className="text-center py-12 text-muted">
                    <CogIcon className="h-12 w-12 mx-auto mb-4" />
                    <p>General settings coming soon...</p>
                  </div>
                </div>
              )}

              {/* Theme Settings */}
              {activeTab === "theme" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-primary">
                    Theme & Appearance
                  </h3>
                  <p className="text-secondary">
                    Customize the appearance of your seller panel with theme
                    options, font sizing, and accessibility preferences.
                  </p>
                  <ThemeSettings />
                </div>
              )}

              {/* Profile Settings */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-primary">
                    Profile Settings
                  </h3>
                  <p className="text-secondary">
                    Manage your seller profile information.
                  </p>
                  <div className="text-center py-12 text-muted">
                    <UserIcon className="h-12 w-12 mx-auto mb-4" />
                    <p>Profile settings coming soon...</p>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-primary">
                    Notification Preferences
                  </h3>
                  <p className="text-secondary">
                    Control how and when you receive notifications.
                  </p>
                  <div className="text-center py-12 text-muted">
                    <BellIcon className="h-12 w-12 mx-auto mb-4" />
                    <p>Notification settings coming soon...</p>
                  </div>
                </div>
              )}

              {/* Store Settings */}
              {activeTab === "store" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-primary">
                    Store Settings
                  </h3>
                  <p className="text-secondary">
                    Configure your store settings and preferences.
                  </p>
                  <div className="text-center py-12 text-muted">
                    <ShoppingBagIcon className="h-12 w-12 mx-auto mb-4" />
                    <p>Store settings coming soon...</p>
                  </div>
                </div>
              )}

              {/* Analytics Settings */}
              {activeTab === "analytics" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-primary">
                    Analytics Settings
                  </h3>
                  <p className="text-secondary">
                    Configure analytics and reporting preferences.
                  </p>
                  <div className="text-center py-12 text-muted">
                    <ChartBarIcon className="h-12 w-12 mx-auto mb-4" />
                    <p>Analytics settings coming soon...</p>
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
