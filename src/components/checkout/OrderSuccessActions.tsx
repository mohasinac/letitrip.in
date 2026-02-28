"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS, ROUTES } from "@/constants";

const { themed } = THEME_CONSTANTS;

interface OrderSuccessActionsProps {
  orderId: string;
}

export function OrderSuccessActions({ orderId }: OrderSuccessActionsProps) {
  const t = useTranslations("orderSuccess");
  const tOrders = useTranslations("orders");
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Link
        href={ROUTES.USER.ORDER_DETAIL(orderId)}
        className="flex-1 text-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
      >
        {t("viewOrder")}
      </Link>
      <Link
        href={ROUTES.USER.ORDERS}
        className={`flex-1 text-center px-6 py-3 ${themed.bgSecondary} border ${themed.border} ${themed.textPrimary} rounded-lg font-medium hover:opacity-80 transition-opacity`}
      >
        {tOrders("title")}
      </Link>
      <Link
        href={ROUTES.PUBLIC.PRODUCTS}
        className={`flex-1 text-center px-6 py-3 ${themed.bgSecondary} border ${themed.border} ${themed.textPrimary} rounded-lg font-medium hover:opacity-80 transition-opacity`}
      >
        {t("continueShopping")}
      </Link>
    </div>
  );
}
