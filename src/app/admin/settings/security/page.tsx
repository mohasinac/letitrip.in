"use client";

import { ShieldCheckIcon } from "@heroicons/react/24/outline";

export default function AdminSecuritySettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-primary">Security Settings</h3>
        <p className="text-secondary">
          Manage security policies, authentication, and access controls.
        </p>
      </div>

      <div className="text-center py-12 text-muted">
        <ShieldCheckIcon className="h-12 w-12 mx-auto mb-4" />
        <p>Security settings coming soon...</p>
        <p className="text-sm">
          Configure 2FA, password policies, and security rules
        </p>
      </div>
    </div>
  );
}
