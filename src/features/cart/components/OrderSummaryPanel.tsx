"use client";

import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import { formatCurrency } from "@/utils";
import { Heading, Span } from "@mohasinac/appkit/ui";

const { themed } = THEME_CONSTANTS;

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
      <Heading level={3} className="font-semibold mb-4">
        {tCart("orderSummary")}
      </Heading>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <Span className={themed.textSecondary}>
            {tCart("itemCount", { count: itemCount })}
          </Span>
          <Span className={themed.textPrimary}>{formatCurrency(subtotal)}</Span>
        </div>

        <div className="flex justify-between">
          <Span className={themed.textSecondary}>
            {tCheckout("shippingFree")}
          </Span>
          <Span className="text-emerald-600 font-medium">
            {tCart("shippingFree")}
          </Span>
        </div>

        <div className="flex justify-between">
          <Span className={themed.textSecondary}>{tCart("tax")}</Span>
          <Span className={`text-xs ${themed.textSecondary}`}>
            {tCheckout("taxIncluded")}
          </Span>
        </div>
      </div>

      <div
        className={`mt-4 pt-4 border-t flex justify-between font-bold ${themed.border}`}
      >
        <Span className={themed.textPrimary}>{tCheckout("orderTotal")}</Span>
        <Span className={`text-lg ${themed.textPrimary}`}>
          {formatCurrency(subtotal)}
        </Span>
      </div>
    </div>
  );
}
