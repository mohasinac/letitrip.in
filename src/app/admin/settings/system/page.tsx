"use client";

import { ServerIcon } from "@heroicons/react/24/outline";

export default function AdminSystemSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-primary">System Settings</h3>
        <p className="text-secondary">
          Configure system-wide settings and performance options.
        </p>
      </div>

      <div className="text-center py-12 text-muted">
        <ServerIcon className="h-12 w-12 mx-auto mb-4" />
        <p>System settings coming soon...</p>
        <p className="text-sm">
          Configure caching, database, and performance settings
        </p>
      </div>
    </div>
  );
}
