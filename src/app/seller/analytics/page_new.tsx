/**
 * Seller Analytics Page
 * Seller-specific analytics using the reusable Analytics component
 */

"use client";

import RoleGuard from "@/components/features/auth/RoleGuard";
import { Analytics } from "@/components/features/analytics/Analytics";
import { SELLER_ROUTES } from "@/constants/routes";

export default function SellerAnalytics() {
  const breadcrumbs = [
    { label: "Seller", href: SELLER_ROUTES.DASHBOARD },
    { label: "Analytics", active: true },
  ];

  return (
    <RoleGuard requiredRole="seller">
      <Analytics
        context="seller"
        title="Analytics Dashboard"
        description="Track your store performance"
        breadcrumbs={breadcrumbs}
      />
    </RoleGuard>
  );
}
