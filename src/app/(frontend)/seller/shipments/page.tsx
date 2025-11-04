"use client";

import RoleGuard from "@/components/features/auth/RoleGuard";
import Shipments from "@/components/features/shipments/Shipments";
import { SELLER_ROUTES } from "@/constants/routes";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";

export default function SellerShipmentsPage() {
  useBreadcrumbTracker([
    { label: "Seller Panel", href: "/seller/dashboard" },
    { label: "Shipments", href: "/seller/shipments" },
  ]);

  return (
    <RoleGuard requiredRole="seller">
      <Shipments
        context="seller"
        title="Shipments"
        description="Track and manage all your shipments"
        breadcrumbs={[
          { label: "Seller Panel", href: "/seller/dashboard" },
          { label: "Shipments", href: "/seller/shipments", active: true },
        ]}
        detailsUrl={(id: string) => `${SELLER_ROUTES.SHIPMENTS}/${id}`}
        orderDetailsUrl={(id: string) => `${SELLER_ROUTES.ORDERS}/${id}`}
        showBulkActions={true}
      />
    </RoleGuard>
  );
}
