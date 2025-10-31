"use client";

import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";

function AdminAnalyticsContent() {
  // Add breadcrumb
  useBreadcrumbTracker([
    {
      label: "Admin",
      href: "/admin",
    },
    {
      label: "Analytics",
      href: "/admin/analytics",
      active: true,
    },
  ]);

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Analytics
        </h1>

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <p className="text-gray-600 dark:text-gray-400">
            Analytics dashboard coming soon. You'll see detailed reports and
            insights about your store's performance here.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminAnalytics() {
  return (
    <RoleGuard requiredRole="admin">
      <AdminAnalyticsContent />
    </RoleGuard>
  );
}
