import { Metadata } from "next";
import { UserSidebar } from "@/components/user/UserSidebar";
import AuthGuard from "@/components/auth/AuthGuard";
import { UserLayoutClient } from "./UserLayoutClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    template: "%s | My Account - Letitrip",
    default: "My Account - Letitrip",
  },
  description: "Manage your orders, favorites, settings, and more on Letitrip",
};

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <UserLayoutClient>
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* Desktop Sidebar - hidden on mobile */}
          <UserSidebar />

          {/* Main Content Area */}
          <div className="flex flex-1 flex-col lg:ml-64">
            {/* Main Content */}
            <main className="flex-1 bg-gray-50 dark:bg-gray-900 pb-32 lg:pb-0">
              <div className="container mx-auto px-4 py-6 lg:px-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </UserLayoutClient>
    </AuthGuard>
  );
}
