"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { AdminCouponEditorView } from "@mohasinac/appkit";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  return (
    <AdminCouponEditorView
      couponId={id}
      onSaved={() => router.push("/admin/coupons")}
      onDeleted={() => router.push("/admin/coupons")}
    />
  );
}
