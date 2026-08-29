"use client";

import { useRouter } from "@/i18n/navigation";
import { SellerCouponEditorView, ROUTES, couponDraftToPayload } from "@mohasinac/appkit/client";
import type { CouponEditorDraft } from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";
import { createStoreCoupon } from "@/lib/api/store-client";

export function CouponNewClient() {
  const router = useRouter();

  const handleSave = async (draft: CouponEditorDraft) => {
    // One conversion, shared with the edit page and stated next to the `when`
    // predicates it mirrors — this used to send `maxDiscount` for every coupon
    // type while the input for it was only rendered for percentages.
    const res = await createStoreCoupon(
      API_ROUTES.STORE.COUPONS,
      couponDraftToPayload(draft),
    );
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
