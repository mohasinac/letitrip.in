"use client";

import { useRouter } from "next/navigation";
import { AdminCouponEditorView } from "@mohasinac/appkit";

export default function Page() {
  const router = useRouter();
  return (
    <AdminCouponEditorView
      onSaved={(id) => router.push(`/admin/coupons/${id}/edit`)}
    />
  );
}
