/**
 * @fileoverview React Component
 * @module src/app/admin/settings/layout
 * @description This file contains the layout component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { TabNav } from "@/components/navigation/TabNav";
import { ADMIN_SETTINGS_TABS } from "@/constants/tabs";

export default /**
 * AdminSettingsLayout component
 *
 * @param {{
  
  children: React.ReactNode;
}} {
  children,
} - The {
  children,
}
 *
 * @returns {any} The adminsettingslayout result
 *
 */
function AdminSettingsLayout({
  children,
}: {
  /** Children */
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
