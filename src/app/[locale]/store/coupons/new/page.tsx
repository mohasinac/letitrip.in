"use client";

import { useRouter } from "@/i18n/navigation";
import { SellerCouponEditorView, ROUTES } from "@mohasinac/appkit";
import type { CouponEditorDraft } from "@mohasinac/appkit";
import { API_ROUTES } from "@/constants";

export default function Page() {
  const router = useRouter();

  const handleSave = async (draft: CouponEditorDraft) => {
    const res = await fetch(API_ROUTES.STORE.COUPONS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: draft.code,
        type: draft.type,
        value: draft.type !== "free_shipping" ? Number(draft.value) || 0 : 0,
        minPurchase: draft.minPurchase ? Number(draft.minPurchase) : undefined,
        maxDiscount: draft.maxDiscount ? Number(draft.maxDiscount) : undefined,
        totalLimit: Number(draft.totalLimit) || 0,
        perUserLimit: Number(draft.perUserLimit) || 0,
        startDate: draft.startDate,
        endDate: draft.endDate,
        isActive: draft.isActive,
        ...(draft.applicableProducts && draft.applicableProducts.length > 0 && { applicableProducts: draft.applicableProducts }),
        ...(draft.applicableCategories && draft.applicableCategories.length > 0 && { applicableCategories: draft.applicableCategories }),
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error((data as { error?: string })?.error ?? "Failed to create coupon");
    }
    router.push(String(ROUTES.STORE.COUPONS));
    router.refresh();
  };

  return (
    <SellerCouponEditorView
      onSave={handleSave}
      onCancel={() => router.push(String(ROUTES.STORE.COUPONS))}
    />
  );
}
