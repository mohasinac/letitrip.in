"use client";

import { CogIcon } from "@heroicons/react/24/outline";

export default function GeneralSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-primary">General Settings</h3>
        <p className="text-secondary">
          Configure your basic seller account settings.
        </p>
      </div>

      <div className="text-center py-12 text-muted">
        <CogIcon className="h-12 w-12 mx-auto mb-4" />
        <p>General settings coming soon...</p>
      </div>
    </div>
  );
}
