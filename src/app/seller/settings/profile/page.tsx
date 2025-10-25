"use client";

import { UserIcon } from "@heroicons/react/24/outline";

export default function ProfileSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-primary">Profile Settings</h3>
        <p className="text-secondary">
          Manage your seller profile information.
        </p>
      </div>

      <div className="text-center py-12 text-muted">
        <UserIcon className="h-12 w-12 mx-auto mb-4" />
        <p>Profile settings coming soon...</p>
      </div>
    </div>
  );
}
