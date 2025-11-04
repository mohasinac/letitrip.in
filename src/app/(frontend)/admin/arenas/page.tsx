"use client";

import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";

function ArenasPageContent() {
  // Add breadcrumb
  useBreadcrumbTracker([
    {
      label: "Admin",
      href: "/admin",
    },
    {
      label: "Arenas",
      href: "/admin/arenas",
      active: true,
    },
  ]);

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Arenas Management
        </h1>

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <p className="text-gray-600 dark:text-gray-400">
            Arena management page coming soon. This page may be a duplicate of{" "}
            <a
              href="/admin/game/stadiums"
              className="text-blue-600 hover:underline"
            >
              /admin/game/stadiums
            </a>
            . Please use the game stadiums page for now.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ArenasPage() {
  return (
    <RoleGuard requiredRole="admin">
      <ArenasPageContent />
    </RoleGuard>
  );
}
