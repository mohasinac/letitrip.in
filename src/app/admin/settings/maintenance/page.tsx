"use client";

import { WrenchScrewdriverIcon } from "@heroicons/react/24/outline";

export default function AdminMaintenanceSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-primary">
          Maintenance Settings
        </h3>
        <p className="text-secondary">
          Configure maintenance modes, backups, and system health monitoring.
        </p>
      </div>

      <div className="text-center py-12 text-muted">
        <WrenchScrewdriverIcon className="h-12 w-12 mx-auto mb-4" />
        <p>Maintenance settings coming soon...</p>
        <p className="text-sm">
          Configure scheduled maintenance, backups, and monitoring
        </p>
      </div>
    </div>
  );
}
