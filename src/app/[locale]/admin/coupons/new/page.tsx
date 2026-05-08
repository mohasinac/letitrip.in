"use client";

import { useRouter } from "next/navigation";
import { AdminCouponEditorView, ROUTES } from "@mohasinac/appkit";

export default function Page() {
  const router = useRouter();
  return (
    <AdminCouponEditorView
      onSaved={(id) => router.push(String(ROUTES.ADMIN.COUPONS_EDIT(id)))}
    />
  );
}
