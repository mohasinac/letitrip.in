/**
 * Admin Dashboard Page
 * Shows platform-wide statistics using the reusable Dashboard component
 */

"use client";

import RoleGuard from "@/components/features/auth/RoleGuard";
import { Dashboard } from "@/components/features/dashboard/Dashboard";

export default function AdminDashboard() {
  return (
    <RoleGuard requiredRole="admin">
      <Dashboard
        context="admin"
        title="Admin Dashboard"
        description="Monitor and manage your platform"
        routes={{
          orders: "/admin/orders",
          products: "/admin/products",
          users: "/admin/users",
          analytics: "/admin/analytics",
        }}
      />
    </RoleGuard>
  );
}
