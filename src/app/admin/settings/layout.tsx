"use client";

import { TabNav } from "@/components/navigation/TabNav";
import { ADMIN_SETTINGS_TABS } from "@/constants/tabs";

export default function AdminSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {/* Settings Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          System Settings
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configure your platform settings, payment gateways, and system
          preferences.
        </p>
      </div>

      {/* Tab Navigation */}
      <TabNav tabs={ADMIN_SETTINGS_TABS} />

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}
