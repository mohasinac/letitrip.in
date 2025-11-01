/**
 * Admin Products Page
 * Lists all products from all sellers using the reusable ProductsList component
 */

"use client";

import RoleGuard from "@/components/features/auth/RoleGuard";
import { ProductsList } from "@/components/features/products/ProductsList";

export default function AdminProducts() {
  const breadcrumbs = [
    { label: "Admin", href: "/admin" },
    { label: "Products", active: true },
  ];

  return (
    <RoleGuard requiredRole="admin">
      <ProductsList
        context="admin"
        basePath="/admin/products"
        breadcrumbs={breadcrumbs}
        showSellerInfo={true}
        getEditRoute={(id) => `/seller/products/${id}/edit`}
      />
    </RoleGuard>
  );
}
