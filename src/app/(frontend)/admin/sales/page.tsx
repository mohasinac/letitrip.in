"use client";

import RoleGuard from "@/components/features/auth/RoleGuard";
import Sales from "@/components/features/sales/Sales";

export default function AdminSalesPage() {
  return (
    <RoleGuard requiredRole="admin">
      <Sales
        context="admin"
        title="All Sales"
        description="Manage sales and promotions from all sellers"
        breadcrumbs={[
          {
            label: "Admin",
            href: "/admin",
          },
          {
            label: "Sales",
            href: "/admin/sales",
            active: true,
          },
        ]}
        editUrl={(id: string) => `/admin/sales/${id}/edit`}
      />
    </RoleGuard>
  );
}
