"use client";

import React, { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useApiQuery } from "@/hooks";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import { Spinner } from "@/components";
import {
  OrderSuccessHero,
  OrderSuccessCard,
  OrderSuccessActions,
} from "@/components";
import { orderService } from "@/services";
import type { OrderDocument } from "@/db/schema";

const { themed, spacing, borderRadius } = THEME_CONSTANTS;

function CheckoutSuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const t = useTranslations("orderSuccess");

  const {
    data: orderData,
    isLoading,
    error,
  } = useApiQuery<{ data: OrderDocument }>({
    queryKey: ["order", orderId ?? ""],
    queryFn: () => orderService.getById(orderId!),
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
            {t("fallbackTitle")}
          </h1>
          <p className={themed.textSecondary}>
            {t("fallbackConfirmed")} — Order ID:{" "}
            <span className="font-mono font-semibold">{orderId}</span>
          </p>
          <p className={`text-sm ${themed.textSecondary}`}>
            {t("fallbackSubtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href={ROUTES.USER.ORDERS}
              className="flex-1 text-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              {t("viewOrders")}
            </Link>
            <Link
              href={ROUTES.PUBLIC.PRODUCTS}
              className={`flex-1 text-center px-4 py-2 ${themed.bgPrimary} border ${themed.border} ${themed.textPrimary} rounded-lg font-medium hover:opacity-80 transition-opacity`}
            >
              {t("continueShopping")}
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

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <CheckoutSuccessPageContent />
    </Suspense>
  );
}
