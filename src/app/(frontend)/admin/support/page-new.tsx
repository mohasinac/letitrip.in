"use client";

import RoleGuard from "@/components/features/auth/RoleGuard";
import Support from "@/components/features/support/Support";

export default function AdminSupportPage() {
  return (
    <RoleGuard requiredRole="admin">
      <Support
        context="admin"
        title="Support Tickets"
        description="Manage and respond to customer support tickets"
        breadcrumbs={[
          {
            label: "Admin",
            href: "/admin",
          },
          {
            label: "Support",
            href: "/admin/support",
            active: true,
          },
        ]}
      />
    </RoleGuard>
  );
}
