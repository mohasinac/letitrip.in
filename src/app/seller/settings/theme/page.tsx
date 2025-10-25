"use client";

import ThemeSettings from "@/components/ui/ThemeSettings";

export default function SellerThemeSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-primary">Theme & Appearance</h3>
        <p className="text-secondary">
          Customize the appearance of your seller panel with theme options, font
          sizing, and accessibility preferences.
        </p>
      </div>

      <ThemeSettings />
    </div>
  );
}
