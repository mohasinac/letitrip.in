"use client";

import RoleGuard from "@/components/features/auth/RoleGuard";
import Sales from "@/components/features/sales/Sales";
import { SELLER_ROUTES } from "@/constants/routes";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";

export default function SellerSalesPage() {
  useBreadcrumbTracker([
    { label: "Seller", href: SELLER_ROUTES.DASHBOARD },
    { label: "Sales", href: SELLER_ROUTES.SALES, active: true },
  ]);

  return (
    <RoleGuard requiredRole="seller">
      <Sales
        context="seller"
        title="Sales"
        description="Manage store-wide sales and promotions"
        breadcrumbs={[
          { label: "Seller", href: SELLER_ROUTES.DASHBOARD },
          { label: "Sales", href: SELLER_ROUTES.SALES, active: true },
        ]}
        createUrl={SELLER_ROUTES.SALES_NEW}
        editUrl={(id: string) => SELLER_ROUTES.SALES_EDIT(id)}
      />
    </RoleGuard>
  );
}
