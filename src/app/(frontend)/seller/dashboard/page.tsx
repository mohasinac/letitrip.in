/**
 * Seller Dashboard Page
 * Shows seller-specific statistics using the reusable Dashboard component
 */

"use client";

import RoleGuard from "@/components/features/auth/RoleGuard";
import { Dashboard } from "@/components/features/dashboard/Dashboard";
import { SELLER_ROUTES } from "@/constants/routes";

export default function SellerDashboard() {
  return (
    <RoleGuard requiredRole="seller">
      <Dashboard
        context="seller"
        title="Seller Dashboard"
        description="Welcome to your seller panel. Manage your store, products, and orders from here."
        routes={{
          products: SELLER_ROUTES.PRODUCTS,
          orders: SELLER_ROUTES.ORDERS,
          shopSetup: SELLER_ROUTES.SHOP_SETUP,
          newProduct: SELLER_ROUTES.PRODUCTS_NEW,
          sales: SELLER_ROUTES.SALES,
          analytics: SELLER_ROUTES.ANALYTICS,
        }}
      />
    </RoleGuard>
  );
}
