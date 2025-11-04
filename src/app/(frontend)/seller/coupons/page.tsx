"use client";

import RoleGuard from "@/components/features/auth/RoleGuard";
import Coupons from "@/components/features/coupons/Coupons";
import { SELLER_ROUTES } from "@/constants/routes";

export default function SellerCouponsPage() {
  return (
    <RoleGuard requiredRole="seller">
      <Coupons
        context="seller"
        title="Coupons"
        description="Manage discount coupons and promotional codes"
        breadcrumbs={[
          {
            label: "Seller",
            href: SELLER_ROUTES.DASHBOARD,
          },
          {
            label: "Coupons",
            href: SELLER_ROUTES.COUPONS,
            active: true,
          },
        ]}
        createUrl={SELLER_ROUTES.COUPONS_NEW}
        editUrl={(id: string) => SELLER_ROUTES.COUPONS_EDIT(id)}
      />
    </RoleGuard>
  );
}
