/**
 * Admin Orders Page
 * Lists all orders from all sellers using the reusable OrdersList component
 */

"use client";

import RoleGuard from "@/components/features/auth/RoleGuard";
import { OrdersList } from "@/components/features/orders/OrdersList";

export default function AdminOrders() {
  const breadcrumbs = [
    { label: "Admin", href: "/admin" },
    { label: "Orders", active: true },
  ];

  return (
    <RoleGuard requiredRole="admin">
      <OrdersList
        context="admin"
        basePath="/admin/orders"
        breadcrumbs={breadcrumbs}
        showSellerInfo={true}
      />
    </RoleGuard>
  );
}
