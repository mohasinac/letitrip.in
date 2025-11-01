"use client";

import RoleGuard from "@/components/features/auth/RoleGuard";
import Categories from "@/components/features/categories/Categories";

export default function AdminCategoriesPage() {
  return (
    <RoleGuard requiredRole="admin">
      <Categories
        title="Category Management"
        description="Manage product categories and hierarchies"
        breadcrumbs={[
          {
            label: "Admin",
            href: "/admin",
          },
          {
            label: "Categories",
            href: "/admin/categories",
            active: true,
          },
        ]}
      />
    </RoleGuard>
  );
}
