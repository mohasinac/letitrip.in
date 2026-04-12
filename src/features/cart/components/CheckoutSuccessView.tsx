"use client";

import React, { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import {
  Heading,
  Text,
  Button,
  Span,
  Spinner,
  Main,
  Stack,
} from "@mohasinac/appkit/ui";

import { OrderSuccessHero } from "./OrderSuccessHero";
import { OrderSuccessCard } from "./OrderSuccessCard";
import { OrderSuccessActions } from "./OrderSuccessActions";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import { useOrder } from "@mohasinac/appkit/features/cart";
import type { OrderDocument } from "@/db/schema";

const { themed, spacing, flex } = THEME_CONSTANTS;

export function CheckoutSuccessView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const t = useTranslations("orderSuccess");

  const { order, isLoading, error } = useOrder<OrderDocument>(orderId, {
    endpoint: `/api/user/orders/${orderId}`,
    queryKeyPrefix: "order",
  });

  useEffect(() => {
    if (!orderId) router.replace(ROUTES.PUBLIC.PRODUCTS);
  }, [orderId, router]);

  if (!orderId) return null;

  if (isLoading) {
    return (
      <Main className={`min-h-screen ${themed.bgPrimary}`}>
        <Stack align="center" className="min-h-screen justify-center">
          <Spinner />
        </Stack>
      </Main>
    );
  }

  if (error || !order) {
    return (
      <Main className={`min-h-screen ${themed.bgPrimary} p-6`}>
        <Stack align="center" className="min-h-full justify-center">
          <Stack
            className={`${themed.bgSecondary} rounded-xl p-6 max-w-md w-full text-center`}
            gap="md"
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
            <Stack gap="3" className="pt-2 sm:flex-row">
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
            </Stack>
          </Stack>
        </Stack>
      </Main>
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
