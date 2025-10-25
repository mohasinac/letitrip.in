"use client";

import { BellIcon } from "@heroicons/react/24/outline";

export default function NotificationSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-primary">
          Notification Preferences
        </h3>
        <p className="text-secondary">
          Control how and when you receive notifications.
        </p>
      </div>

      <div className="text-center py-12 text-muted">
        <BellIcon className="h-12 w-12 mx-auto mb-4" />
        <p>Notification settings coming soon...</p>
      </div>
    </div>
  );
}
