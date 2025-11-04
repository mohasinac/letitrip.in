"use client";

import RoleGuard from "@/components/features/auth/RoleGuard";
import Users from "@/components/features/users/Users";

export default function AdminUsersPage() {
  return (
    <RoleGuard requiredRole="admin">
      <Users
        title="User Management"
        description="Manage user accounts, roles, and permissions"
        breadcrumbs={[
          {
            label: "Admin",
            href: "/admin",
          },
          {
            label: "Users",
            href: "/admin/users",
            active: true,
          },
        ]}
      />
    </RoleGuard>
  );
}
