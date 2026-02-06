/**
 * Admin Sessions Page
 *
 * View and manage active user sessions across all devices.
 * Monitor login activity, device information, and revoke sessions for security.
 */

import { Suspense } from "react";
import { AdminSessionsManager } from "@/components/admin/AdminSessionsManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Session Management | Admin Dashboard",
  description: "View and manage active user sessions",
};

export default function AdminSessionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Session Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Monitor and manage active user sessions across all devices
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }
      >
        <AdminSessionsManager />
      </Suspense>
    </div>
  );
}
