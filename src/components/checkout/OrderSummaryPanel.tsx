"use client";

import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import { formatCurrency } from "@/utils";

const { themed, borderRadius } = THEME_CONSTANTS;

interface OrderSummaryPanelProps {
  itemCount: number;
  subtotal: number;
}

export function OrderSummaryPanel({
  itemCount,
  subtotal,
}: OrderSummaryPanelProps) {
  const tCart = useTranslations("cart");
  const tCheckout = useTranslations("checkout");
  return (
    <div
      className={`p-5 rounded-xl border ${themed.bgPrimary} ${themed.border} sticky top-24`}
    >
      <h3 className={`font-semibold mb-4 ${themed.textPrimary}`}>
        {tCart("orderSummary")}
      </h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className={themed.textSecondary}>
            {tCart("itemCount", { count: itemCount })}
          </span>
          <span className={themed.textPrimary}>{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between">
          <span className={themed.textSecondary}>
            {tCheckout("shippingFree")}
          </span>
          <span className="text-emerald-600 font-medium">
            {tCart("shippingFree")}
          </span>
        </div>

        <div className="flex justify-between">
          <span className={themed.textSecondary}>{tCart("tax")}</span>
          <span className={`text-xs ${themed.textSecondary}`}>
            {tCheckout("taxIncluded")}
          </span>
        </div>
      </div>

      <div
        className={`mt-4 pt-4 border-t flex justify-between font-bold ${themed.border}`}
      >
        <span className={themed.textPrimary}>{tCheckout("orderTotal")}</span>
        <span className={`text-lg ${themed.textPrimary}`}>
          {formatCurrency(subtotal)}
        </span>
      </div>
    </div>
  );
}
