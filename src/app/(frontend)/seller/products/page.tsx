/**
 * Seller Products Page
 * Lists seller's products using the reusable ProductsList component
 */

"use client";

import RoleGuard from "@/components/features/auth/RoleGuard";
import { ProductsList } from "@/components/features/products/ProductsList";
import { SELLER_ROUTES } from "@/constants/routes";

export default function SellerProducts() {
  const breadcrumbs = [
    { label: "Seller", href: SELLER_ROUTES.DASHBOARD },
    { label: "Products", active: true },
  ];

  return (
    <RoleGuard requiredRole="seller">
      <ProductsList
        context="seller"
        basePath={SELLER_ROUTES.PRODUCTS}
        breadcrumbs={breadcrumbs}
        showSellerInfo={false}
        createRoute={SELLER_ROUTES.PRODUCTS_NEW}
        getEditRoute={(id) => SELLER_ROUTES.PRODUCTS_EDIT(id)}
      />
    </RoleGuard>
  );
}
