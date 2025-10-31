"use client";

import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";

function AdminSupportContent() {
  // Add breadcrumb
  useBreadcrumbTracker([
    {
      label: "Admin",
      href: "/admin",
    },
    {
      label: "Support",
      href: "/admin/support",
      active: true,
    },
  ]);

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Support
        </h1>

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <p className="text-gray-600 dark:text-gray-400">
            Support management interface coming soon. You'll be able to handle
            customer inquiries and support tickets from here.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminSupport() {
  return (
    <RoleGuard requiredRole="admin">
      <AdminSupportContent />
    </RoleGuard>
  );
}
