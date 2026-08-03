"use client";

import { useRouter } from "@/i18n/navigation";
import { SellerCouponsView, ROUTES } from "@mohasinac/appkit";
import { API_ROUTES } from "@/constants";
import { updateStoreCoupon, deleteStoreCoupon } from "@/lib/api/store-client";

export function SellerCouponsClient() {
  const router = useRouter();

  const handleToggle = async (couponId: string, currentlyActive: boolean) => {
    await updateStoreCoupon(API_ROUTES.STORE.COUPON_BY_ID(couponId), { action: currentlyActive ? "deactivate" : "activate" });
  };

  const handleDelete = async (couponId: string) => {
    await deleteStoreCoupon(API_ROUTES.STORE.COUPON_BY_ID(couponId));
  };

  return (
    <SellerCouponsView
      onCreateClick={() => router.push(String(ROUTES.STORE.COUPONS_NEW))}
      onEditClick={(id) => router.push(String(ROUTES.STORE.COUPONS_EDIT(id)))}
      onToggle={handleToggle}
      onDelete={handleDelete}
    />
  );
}
