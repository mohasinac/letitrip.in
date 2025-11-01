"use client";

import RoleGuard from "@/components/features/auth/RoleGuard";
import Shipments from "@/components/features/shipments/Shipments";

export default function AdminShipmentsPage() {
  return (
    <RoleGuard requiredRole="admin">
      <Shipments
        context="admin"
        title="All Shipments"
        description="Track and manage shipments from all sellers"
        breadcrumbs={[
          {
            label: "Admin",
            href: "/admin",
          },
          {
            label: "Shipments",
            href: "/admin/shipments",
            active: true,
          },
        ]}
        detailsUrl={(id: string) => `/admin/shipments/${id}`}
        orderDetailsUrl={(id: string) => `/admin/orders/${id}`}
        showBulkActions={false}
      />
    </RoleGuard>
  );
}
