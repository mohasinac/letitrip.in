"use client";

import { useRouter } from "next/navigation";
import { SellerCouponsView } from "@mohasinac/appkit";
import { API_ROUTES } from "@/constants/api";

export default function Page() {
  const router = useRouter();

  const handleToggle = async (couponId: string, currentlyActive: boolean) => {
    await fetch(API_ROUTES.STORE.COUPON_BY_ID(couponId), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: currentlyActive ? "deactivate" : "activate" }),
    });
  };

  const handleDelete = async (couponId: string) => {
    await fetch(API_ROUTES.STORE.COUPON_BY_ID(couponId), { method: "DELETE" });
  };

  return (
    <SellerCouponsView
      onCreateClick={() => router.push("/store/coupons/new")}
      onEditClick={(id) => router.push(`/store/coupons/${id}/edit`)}
      onToggle={handleToggle}
      onDelete={handleDelete}
    />
  );
}
