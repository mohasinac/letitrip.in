import { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import AuthGuard from "@/components/auth/AuthGuard";

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
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col lg:ml-64">
          {/* Main Content */}
          <main className="flex-1">
            <div className="container mx-auto px-4 py-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
