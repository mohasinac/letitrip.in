"use client";

import { ClockIcon } from "@heroicons/react/24/outline";

export default function SellerPendingOrders() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-primary">Pending Orders</h3>
        <p className="text-secondary">
          Orders waiting for your confirmation and processing.
        </p>
      </div>

      <div className="text-center py-12 text-muted">
        <ClockIcon className="h-12 w-12 mx-auto mb-4" />
        <p>Pending orders coming soon...</p>
        <p className="text-sm">View and process orders requiring your action</p>
      </div>
    </div>
  );
}
