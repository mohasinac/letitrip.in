"use client";

import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";

function GameSettingsPageContent() {
  // Add breadcrumb
  useBreadcrumbTracker([
    {
      label: "Admin",
      href: "/admin",
    },
    {
      label: "Game",
      href: "/admin/game",
    },
    {
      label: "Settings",
      href: "/admin/game/settings",
      active: true,
    },
  ]);

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Game Settings
        </h1>

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Game settings management page coming soon. Configure game mechanics,
            battle rules, and win conditions here.
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            For now, you can manage game-related settings in{" "}
            <a
              href="/admin/settings/game"
              className="text-blue-600 hover:underline"
            >
              Admin Settings → Game
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default function GameSettingsPage() {
  return (
    <RoleGuard requiredRole="admin">
      <GameSettingsPageContent />
    </RoleGuard>
  );
}
