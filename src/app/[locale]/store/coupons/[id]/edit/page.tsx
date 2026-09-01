"use client";

import {useEffect, useState, Suspense } from "react";
import { useRouter } from "@/i18n/navigation"
import { useParams } from "next/navigation";
import { Div, ROUTES, Row, SellerCouponEditorView, Text } from "@mohasinac/appkit/client";
import type { CouponEditorDraft } from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";
import { getStoreCoupon, updateStoreCoupon } from "@/lib/api/store-client";



interface CouponData {
  id: string;
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  discount?: { value?: number; minPurchase?: number; maxDiscount?: number };
  usage?: { totalLimit?: number; perUserLimit?: number };
  validity?: { startDate?: string | { _seconds?: number }; endDate?: string | { _seconds?: number }; isActive?: boolean };
  restrictions?: { applicableProducts?: string[]; applicableCategories?: string[]; firstTimeUserOnly?: boolean; };
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
  const value = typeof discount.value === "number" ? String(discount.value) : "";
  const restrictions = coupon.restrictions ?? {};
  return {
    code: coupon.code,
    type: coupon.type ?? "percentage",
    value,
    minPurchase: discount.minPurchase ? String(discount.minPurchase) : "",
    maxDiscount: discount.maxDiscount ? String(discount.maxDiscount) : "",
    totalLimit: String(usage.totalLimit ?? 0),
    perUserLimit: String(usage.perUserLimit ?? 0),
    startDate: toDateString(validity.startDate as string | { _seconds?: number }),
    endDate: toDateString(validity.endDate as string | { _seconds?: number }),
    isActive: validity.isActive ?? true,
    applicableProducts: restrictions.applicableProducts ?? [],
    applicableCategories: restrictions.applicableCategories ?? [],
  };
}

function PageInner() {
  const router = useRouter();
  const params = useParams();
  const couponId = String(params.id ?? "");

  const [initial, setInitial] = useState<Partial<CouponEditorDraft> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!couponId) return;
    getStoreCoupon(API_ROUTES.STORE.COUPON_BY_ID(couponId))
      .then((r) => r.json())
      .then((json) => {
        const coupon = (json?.data ?? json) as CouponData;
        setInitial(toDraftFromCoupon(coupon));
      })
      .catch(() => setLoadError("Failed to load coupon"));
  }, [couponId]);

  const handleSave = async (draft: CouponEditorDraft) => {
    const res = await updateStoreCoupon(API_ROUTES.STORE.COUPON_BY_ID(couponId), {
      validity: {
        startDate: draft.startDate,
        endDate: draft.endDate,
        isActive: draft.isActive,
      },
      usage: {
        totalLimit: Number(draft.totalLimit) || 0,
        perUserLimit: Number(draft.perUserLimit) || 0,
      },
      /*
       * The PATCH payload is nested (validity / usage / discount /
       * restrictions) where the POST one is flat, so this cannot call
       * `couponDraftToPayload` — but it must apply the same rule, which is
       * stated beside the `when` predicates in `coupon-form.ts`: a field the
       * form hides is a field the payload omits.
       *
       * `maxDiscount` used to be sent for every type while its input rendered
       * only for percentages, so a cap survived a switch to fixed or
       * free-shipping with nothing on screen to show it.
       */
      discount: {
        value: draft.type !== "free_shipping" ? Number(draft.value) || 0 : 0,
        ...(draft.minPurchase ? { minPurchase: Math.round(Number(draft.minPurchase) * 100) / 100 } : {}),
        ...(draft.type === "percentage" && draft.maxDiscount
          ? { maxDiscount: Math.round(Number(draft.maxDiscount) * 100) / 100 }
          : {}),
      },
      restrictions: {
        applicableProducts: draft.applicableProducts ?? [],
        applicableCategories: draft.applicableCategories ?? [],
      },
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
      <Row className="min-h-screen" align="center" justify="center">
        <Text className="text-error" size="sm">{loadError}</Text>
      </Row>
    );
  }

  if (!initial) {
    return (
      <Row className="min-h-screen" align="center" justify="center">
        <Div className="h-6 w-6 animate-spin border-2 border-[var(--appkit-color-primary)] border-t-transparent" rounded="full" />
      </Row>
    );
  }

  return (
    <SellerCouponEditorView
      couponId={couponId}
      initial={initial}
      onSave={handleSave}
      onCancel={() => router.push(String(ROUTES.STORE.COUPONS))}
    />
  );
}

/*
 * Page-level Suspense. `export const dynamic` is a SERVER route-segment
 * config and has NO effect in a "use client" file, so it cannot make this
 * page dynamic — the client tree below reaches useSearchParams(), which
 * throws during prerender without a boundary (Root Cause #17). The dashboard
 * layout wraps {children} in Suspense too, and empirically that is not enough
 * for a client PAGE component.
 */
export default function Page() {
  return (
    <Suspense>
      <PageInner />
    </Suspense>
  );
}
