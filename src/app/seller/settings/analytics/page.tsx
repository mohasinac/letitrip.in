"use client";

import { ChartBarIcon } from "@heroicons/react/24/outline";

export default function AnalyticsSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-primary">Analytics Settings</h3>
        <p className="text-secondary">
          Configure analytics and reporting preferences.
        </p>
      </div>

      <div className="text-center py-12 text-muted">
        <ChartBarIcon className="h-12 w-12 mx-auto mb-4" />
        <p>Analytics settings coming soon...</p>
      </div>
    </div>
  );
}
