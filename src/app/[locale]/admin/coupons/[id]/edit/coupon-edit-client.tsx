"use client";

import { useRouter } from "@/i18n/navigation";
import { AdminCouponEditorView, ROUTES } from "@mohasinac/appkit/client";

export function CouponEditClient({ id }: { id: string }) {
  const router = useRouter();
  return (
    <AdminCouponEditorView
      couponId={id}
      onSaved={() => router.push(String(ROUTES.ADMIN.COUPONS))}
      onDeleted={() => router.push(String(ROUTES.ADMIN.COUPONS))}
    />
  );
}
