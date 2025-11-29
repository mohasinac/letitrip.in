import { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import AuthGuard from "@/components/auth/AuthGuard";
import { AdminLayoutClient } from "./AdminLayoutClient";

export const metadata: Metadata = {
  title: {
    template: "%s | Admin Dashboard - Letitrip",
    default: "Admin Dashboard - Letitrip",
  },
  description:
    "Manage users, shops, products, and platform settings on Letitrip",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["admin"]}>
      <AdminLayoutClient>
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* Desktop Sidebar */}
          <AdminSidebar />

          {/* Main Content Area */}
          <div className="flex flex-1 flex-col lg:ml-64">
            {/* Main Content */}
            <main className="flex-1 bg-gray-50 dark:bg-gray-900">
              <div className="container mx-auto px-4 py-6 lg:px-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </AdminLayoutClient>
    </AuthGuard>
  );
}
