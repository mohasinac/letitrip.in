"use client";

import RoleGuard from "@/components/features/auth/RoleGuard";
import SettingsLayout from "@/components/admin/settings/SettingsLayout";
import ThemeSettingsComponent from "@/components/admin/settings/ThemeSettings";

function ThemeSettingsContent() {
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
