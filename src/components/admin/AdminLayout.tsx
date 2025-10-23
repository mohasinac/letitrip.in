"use client";

import { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";
import RoleGuard from "@/components/auth/RoleGuard";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <RoleGuard requiredRole="admin">
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />

        {/* Main content */}
        <div className="lg:pl-72 flex-1">
          <main className="min-h-screen">{children}</main>
        </div>
      </div>
    </RoleGuard>
  );
}
