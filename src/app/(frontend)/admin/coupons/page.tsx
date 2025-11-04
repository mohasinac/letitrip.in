"use client";

import RoleGuard from "@/components/features/auth/RoleGuard";
import Coupons from "@/components/features/coupons/Coupons";

export default function AdminCouponsPage() {
  return (
    <RoleGuard requiredRole="admin">
      <Coupons
        context="admin"
        title="All Coupons"
        description="Manage coupons from all sellers"
        breadcrumbs={[
          {
            label: "Admin",
            href: "/admin",
          },
          {
            label: "Coupons",
            href: "/admin/coupons",
            active: true,
          },
        ]}
        createUrl="/admin/coupons/new"
        editUrl={(id: string) => `/admin/coupons/${id}/edit`}
      />
    </RoleGuard>
  );
}
