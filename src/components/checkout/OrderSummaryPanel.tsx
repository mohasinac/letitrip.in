"use client";

import { UI_LABELS, THEME_CONSTANTS } from "@/constants";
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
  return (
    <div
      className={`p-5 rounded-xl border ${themed.bgPrimary} ${themed.border} sticky top-24`}
    >
      <h3 className={`font-semibold mb-4 ${themed.textPrimary}`}>
        {UI_LABELS.CART.ORDER_SUMMARY}
      </h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className={themed.textSecondary}>
            {UI_LABELS.CART.ITEM_COUNT(itemCount)}
          </span>
          <span className={themed.textPrimary}>{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between">
          <span className={themed.textSecondary}>
            {UI_LABELS.CHECKOUT.SHIPPING_FREE}
          </span>
          <span className="text-emerald-600 font-medium">
            {UI_LABELS.CART.SHIPPING_FREE}
          </span>
        </div>

        <div className="flex justify-between">
          <span className={themed.textSecondary}>{UI_LABELS.CART.TAX}</span>
          <span className={`text-xs ${themed.textSecondary}`}>
            {UI_LABELS.CHECKOUT.TAX_INCLUDED}
          </span>
        </div>
      </div>

      <div
        className={`mt-4 pt-4 border-t flex justify-between font-bold ${themed.border}`}
      >
        <span className={themed.textPrimary}>
          {UI_LABELS.CHECKOUT.ORDER_TOTAL}
        </span>
        <span className={`text-lg ${themed.textPrimary}`}>
          {formatCurrency(subtotal)}
        </span>
      </div>
    </div>
  );
}
