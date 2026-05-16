"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation"
import { useParams } from "next/navigation";
import { SellerCouponEditorView, Text, Div, ROUTES } from "@mohasinac/appkit";
import type { CouponEditorDraft } from "@mohasinac/appkit";
import { API_ROUTES } from "@/constants";

interface CouponData {
  id: string;
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  discount?: { value?: number; minPurchase?: number; maxDiscount?: number };
  usage?: { totalLimit?: number; perUserLimit?: number };
  validity?: { startDate?: string | { _seconds?: number }; endDate?: string | { _seconds?: number }; isActive?: boolean };
}

function toDateString(val: string | { _seconds?: number } | undefined): string {
  if (!val) return "";
  if (typeof val === "string") return val.slice(0, 10);
  if (val._seconds) return new Date(val._seconds * 1000).toISOString().slice(0, 10);
  return "";
}

function toDraftFromCoupon(coupon: CouponData): Partial<CouponEditorDraft> {
  const discount = coupon.discount ?? {};
  const usage = coupon.usage ?? {};
  const validity = coupon.validity ?? {};
  const value = typeof discount.value === "number"
    ? coupon.type === "fixed" ? String(discount.value / 100) : String(discount.value)
    : "";
  return {
    code: coupon.code,
    type: coupon.type ?? "percentage",
    value,
    minPurchase: discount.minPurchase ? String(discount.minPurchase / 100) : "",
    maxDiscount: discount.maxDiscount ? String(discount.maxDiscount / 100) : "",
    totalLimit: String(usage.totalLimit ?? 0),
    perUserLimit: String(usage.perUserLimit ?? 0),
    startDate: toDateString(validity.startDate as string | { _seconds?: number }),
    endDate: toDateString(validity.endDate as string | { _seconds?: number }),
    isActive: validity.isActive ?? true,
  };
}

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const couponId = String(params.id ?? "");

  const [initial, setInitial] = useState<Partial<CouponEditorDraft> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!couponId) return;
    fetch(API_ROUTES.STORE.COUPON_BY_ID(couponId))
      .then((r) => r.json())
      .then((json) => {
        const coupon = (json?.data ?? json) as CouponData;
        setInitial(toDraftFromCoupon(coupon));
      })
      .catch(() => setLoadError("Failed to load coupon"));
  }, [couponId]);

  const handleSave = async (draft: CouponEditorDraft) => {
    const res = await fetch(API_ROUTES.STORE.COUPON_BY_ID(couponId), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        validity: {
          startDate: draft.startDate,
          endDate: draft.endDate,
          isActive: draft.isActive,
        },
        usage: {
          totalLimit: Number(draft.totalLimit) || 0,
          perUserLimit: Number(draft.perUserLimit) || 0,
        },
        discount: {
          value: draft.type !== "free_shipping" ? Number(draft.value) || 0 : 0,
          ...(draft.minPurchase ? { minPurchase: Math.round(Number(draft.minPurchase) * 100) } : {}),
          ...(draft.maxDiscount ? { maxDiscount: Math.round(Number(draft.maxDiscount) * 100) } : {}),
        },
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error((data as { error?: string })?.error ?? "Failed to update coupon");
    }
    router.push(String(ROUTES.STORE.COUPONS));
    router.refresh();
  };

  if (loadError) {
    return (
      <Div className="flex min-h-screen items-center justify-center">
        <Text className="text-sm text-red-600 dark:text-red-400">{loadError}</Text>
      </Div>
    );
  }

  if (!initial) {
    return (
      <Div className="flex min-h-screen items-center justify-center">
        <Div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--appkit-color-primary)] border-t-transparent" />
      </Div>
    );
  }

  return (
    <Div className="py-8 px-4">
      <SellerCouponEditorView
        couponId={couponId}
        initial={initial}
        onSave={handleSave}
        onCancel={() => router.push(String(ROUTES.STORE.COUPONS))}
      />
    </Div>
  );
}
