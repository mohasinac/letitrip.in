"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useApiQuery } from "@/hooks";
import { API_ENDPOINTS, ROUTES, UI_LABELS, THEME_CONSTANTS } from "@/constants";
import { Spinner } from "@/components";
import {
  OrderSuccessHero,
  OrderSuccessCard,
  OrderSuccessActions,
} from "@/components";
import type { OrderDocument } from "@/db/schema";

const LABELS = UI_LABELS.ORDER_SUCCESS_PAGE;
const { themed, spacing, borderRadius } = THEME_CONSTANTS;

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const {
    data: orderData,
    isLoading,
    error,
  } = useApiQuery<{ data: OrderDocument }>({
    queryKey: ["order", orderId ?? ""],
    queryFn: async () => {
      const res = await fetch(API_ENDPOINTS.ORDERS.GET_BY_ID(orderId!));
      if (!res.ok) throw new Error("Failed to fetch order");
      return res.json();
    },
    enabled: !!orderId,
  });

  const order = orderData?.data;

  useEffect(() => {
    if (!orderId) router.replace(ROUTES.PUBLIC.PRODUCTS);
  }, [orderId, router]);

  if (!orderId) return null;

  if (isLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${themed.bgPrimary}`}
      >
        <Spinner />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center ${themed.bgPrimary} ${spacing.padding.lg}`}
      >
        <div
          className={`${themed.bgSecondary} ${borderRadius.xl} ${spacing.padding.lg} max-w-md w-full text-center ${spacing.stack}`}
        >
          <div className="text-5xl mb-2">✅</div>
          <h1 className={`text-2xl font-bold ${themed.textPrimary}`}>
            {LABELS.FALLBACK_TITLE}
          </h1>
          <p className={themed.textSecondary}>
            {UI_LABELS.ACTIONS.CONFIRM} — Order ID:{" "}
            <span className="font-mono font-semibold">{orderId}</span>
          </p>
          <p className={`text-sm ${themed.textSecondary}`}>
            {LABELS.FALLBACK_SUBTITLE}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href={ROUTES.USER.ORDERS}
              className="flex-1 text-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              {UI_LABELS.USER.ORDERS.TITLE}
            </Link>
            <Link
              href={ROUTES.PUBLIC.PRODUCTS}
              className={`flex-1 text-center px-4 py-2 ${themed.bgPrimary} border ${themed.border} ${themed.textPrimary} rounded-lg font-medium hover:opacity-80 transition-opacity`}
            >
              {LABELS.CONTINUE_SHOPPING}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themed.bgPrimary} py-12 px-4`}>
      <div className="max-w-2xl mx-auto">
        <OrderSuccessHero />
        <OrderSuccessCard order={order} />
        <OrderSuccessActions orderId={order.id} />
      </div>
    </div>
  );
}
