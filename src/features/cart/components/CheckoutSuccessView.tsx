"use client";

import React, { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Spinner, Heading, Text, Span, Button } from "@/components";
import { OrderSuccessHero } from "./OrderSuccessHero";
import { OrderSuccessCard } from "./OrderSuccessCard";
import { OrderSuccessActions } from "./OrderSuccessActions";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import { useOrder } from "../hooks/useOrder";

const { themed, spacing, flex } = THEME_CONSTANTS;

export function CheckoutSuccessView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const t = useTranslations("orderSuccess");

  const { order, isLoading, error } = useOrder(orderId);

  useEffect(() => {
    if (!orderId) router.replace(ROUTES.PUBLIC.PRODUCTS);
  }, [orderId, router]);

  if (!orderId) return null;

  if (isLoading) {
    return (
      <div className={`min-h-screen ${flex.center} ${themed.bgPrimary}`}>
        <Spinner />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={`min-h-screen ${flex.centerCol} ${themed.bgPrimary} p-6`}>
        <div
          className={`${themed.bgSecondary} rounded-xl p-6 max-w-md w-full text-center ${spacing.stack}`}
        >
          <div className="text-5xl mb-2">✅</div>
          <Heading level={1} className="text-2xl font-bold">
            {t("fallbackTitle")}
          </Heading>
          <Text variant="secondary">
            {t("fallbackConfirmed")} — Order ID:{" "}
            <Span className="font-mono font-semibold" variant="inherit">
              {orderId}
            </Span>
          </Text>
          <Text size="sm" variant="secondary">
            {t("fallbackSubtitle")}
          </Text>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="primary"
              onClick={() => router.push(ROUTES.USER.ORDERS)}
              className="flex-1"
            >
              {t("viewOrders")}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(ROUTES.PUBLIC.PRODUCTS)}
              className="flex-1"
            >
              {t("continueShopping")}
            </Button>
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
