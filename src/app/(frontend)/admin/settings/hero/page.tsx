"use client";

import { useState } from "react";
import RoleGuard from "@/components/features/auth/RoleGuard";
import SettingsLayout from "@/components/admin/settings/SettingsLayout";
import HeroCarouselSettings from "@/components/admin/settings/hero/HeroCarouselSettings";
import HeroProductSettings from "@/components/admin/settings/hero/HeroProductSettings";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`hero-tabpanel-${index}`}
      aria-labelledby={`hero-tab-${index}`}
    >
      {value === index && <div className="pt-6">{children}</div>}
    </div>
  );
}

function HeroSettingsContent() {
  const [tabValue, setTabValue] = useState(0);

  // Add breadcrumb
  useBreadcrumbTracker([
    {
      label: "Admin",
      href: "/admin",
    },
    {
      label: "Settings",
      href: "/admin/settings",
    },
    {
      label: "Hero",
      href: "/admin/settings/hero",
      active: true,
    },
  ]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <SettingsLayout>
      {/* Sub-tabs for Hero Settings */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8" aria-label="hero settings tabs">
          <button
            onClick={(e) => handleTabChange(e, 0)}
            id="hero-tab-0"
            className={`py-3 px-1 font-semibold border-b-2 transition-colors ${
              tabValue === 0
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            Carousel Backgrounds
          </button>
          <button
            onClick={(e) => handleTabChange(e, 1)}
            id="hero-tab-1"
            className={`py-3 px-1 font-semibold border-b-2 transition-colors ${
              tabValue === 1
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            Featured Products
          </button>
        </nav>
      </div>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <HeroCarouselSettings />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <HeroProductSettings />
      </TabPanel>
    </SettingsLayout>
  );
}

export default function HeroSettings() {
  return (
    <RoleGuard requiredRole="admin">
      <HeroSettingsContent />
    </RoleGuard>
  );
}
