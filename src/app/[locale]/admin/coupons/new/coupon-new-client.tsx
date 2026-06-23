"use client";

import { useRouter } from "@/i18n/navigation";
import { AdminCouponEditorView, ROUTES } from "@mohasinac/appkit";

export function CouponNewClient() {
  const router = useRouter();
  return (
    <AdminCouponEditorView
      onSaved={(id) => router.push(String(ROUTES.ADMIN.COUPONS_EDIT(id)))}
    />
  );
}
