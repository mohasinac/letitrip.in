"use client";

import RoleGuard from "@/components/features/auth/RoleGuard";
import SettingsLayout from "@/components/admin/settings/SettingsLayout";
import ThemeSettingsComponent from "@/components/admin/settings/ThemeSettings";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";

function ThemeSettingsContent() {
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
      label: "Theme",
      href: "/admin/settings/theme",
      active: true,
    },
  ]);

  return (
    <SettingsLayout>
      <ThemeSettingsComponent />
    </SettingsLayout>
  );
}

export default function ThemeSettings() {
  return (
    <RoleGuard requiredRole="admin">
      <ThemeSettingsContent />
    </RoleGuard>
  );
}
