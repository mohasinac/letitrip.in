"use client";

import Link from "next/link";
import { ROUTES, UI_LABELS, THEME_CONSTANTS } from "@/constants";
import { formatCurrency } from "@/utils";

const { themed, borderRadius } = THEME_CONSTANTS;

interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
  onCheckout: () => void;
  isCheckingOut?: boolean;
}

export function CartSummary({
  subtotal,
  itemCount,
  onCheckout,
  isCheckingOut = false,
}: CartSummaryProps) {
  return (
    <div
      className={`${themed.bgPrimary} ${borderRadius.xl} border ${themed.border} p-5 space-y-4 sticky top-20`}
    >
      <h2 className={`text-base font-bold ${themed.textPrimary}`}>
        {UI_LABELS.CART.ORDER_SUMMARY}
      </h2>

      {/* Line items */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className={themed.textSecondary}>
            {UI_LABELS.CART.ITEMS_SUBTOTAL} (
            {UI_LABELS.CART.ITEM_COUNT(itemCount)})
          </span>
          <span className={themed.textPrimary}>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className={themed.textSecondary}>
            {UI_LABELS.CART.SHIPPING}
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {UI_LABELS.CART.SHIPPING_CALCULATED}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className={themed.textSecondary}>{UI_LABELS.CART.TAX}</span>
          <span className={themed.textSecondary}>
            {UI_LABELS.CART.TAX_CALCULATED}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className={`border-t ${themed.border}`} />

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className={`font-bold ${themed.textPrimary}`}>
          {UI_LABELS.CART.TOTAL}
        </span>
        <span className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
          {formatCurrency(subtotal)}
        </span>
      </div>

      {/* CTA */}
      <button
        onClick={onCheckout}
        disabled={isCheckingOut || itemCount === 0}
        className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors text-sm"
      >
        {isCheckingOut ? UI_LABELS.LOADING.DEFAULT : UI_LABELS.CART.CHECKOUT}
      </button>

      {/* Continue shopping */}
      <Link
        href={ROUTES.PUBLIC.PRODUCTS}
        className={`block text-center text-sm ${themed.textSecondary} hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors`}
      >
        ← {UI_LABELS.CART.CONTINUE_SHOPPING}
      </Link>
    </div>
  );
}
