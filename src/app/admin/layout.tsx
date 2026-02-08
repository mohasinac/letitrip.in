import { ReactNode } from "react";
import { AdminTabs, Card } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

export const metadata = {
  title: "Admin Dashboard - LetItRip",
  description: "Admin panel for managing the LetItRip platform",
};

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header
        className={`bg-white dark:bg-gray-800 border-b ${THEME_CONSTANTS.themed.borderColor}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1
            className={`text-2xl font-bold ${THEME_CONSTANTS.themed.textPrimary}`}
          >
            Admin Dashboard
          </h1>
          <p className={`text-sm ${THEME_CONSTANTS.themed.textSecondary} mt-1`}>
            Manage your platform content and settings
          </p>
        </div>
      </header>

      {/* Tab Navigation */}
      <div
        className={`bg-white dark:bg-gray-800 border-b ${THEME_CONSTANTS.themed.borderColor}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdminTabs />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6">{children}</Card>
      </main>
    </div>
  );
}
