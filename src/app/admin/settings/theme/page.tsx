"use client";

import ThemeSettings from "@/components/ui/ThemeSettings";

export default function AdminThemeSettingsPage() {
  return (
    <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary">Theme Settings</h1>
          <p className="mt-2 text-secondary">
            Customize the appearance of your admin panel with theme options,
            font sizing, and accessibility preferences.
          </p>
        </div>

        <div className="max-w-2xl">
          <ThemeSettings />
        </div>
      </div>
  );
}
