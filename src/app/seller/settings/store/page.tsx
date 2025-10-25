"use client";

import StoreSettings from "@/components/seller/StoreSettings";

export default function StoreSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-primary">Store Settings</h3>
        <p className="text-secondary">
          Configure your store name, status, and display preferences.
        </p>
      </div>

      <StoreSettings />
    </div>
  );
}
