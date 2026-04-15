"use client";

import { useTranslations } from "next-intl";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { TextLink } from "@/components";

const { themed } = THEME_CONSTANTS;

interface OrderSuccessActionsProps {
  orderId: string;
}

export function OrderSuccessActions({ orderId }: OrderSuccessActionsProps) {
  const t = useTranslations("orderSuccess");
  const tOrders = useTranslations("orders");
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <TextLink
        href={ROUTES.USER.ORDER_DETAIL(orderId)}
        className="flex-1 text-center px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
      >
        {t("viewOrder")}
      </TextLink>
      <TextLink
        href={ROUTES.USER.ORDERS}
        className={`flex-1 text-center px-6 py-3 ${themed.bgSecondary} border ${themed.border} ${themed.textPrimary} rounded-lg font-medium hover:opacity-80 transition-opacity`}
      >
        {tOrders("title")}
      </TextLink>
      <TextLink
        href={ROUTES.PUBLIC.PRODUCTS}
        className={`flex-1 text-center px-6 py-3 ${themed.bgSecondary} border ${themed.border} ${themed.textPrimary} rounded-lg font-medium hover:opacity-80 transition-opacity`}
      >
        {t("continueShopping")}
      </TextLink>
    </div>
  );
}

