"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { formatCurrency } from "@/utils";

const { themed, borderRadius } = THEME_CONSTANTS;

interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
  onCheckout: () => void;
  isCheckingOut?: boolean;
  discount?: number;
  couponCode?: string;
}

export function CartSummary({
  subtotal,
  itemCount,
  onCheckout,
  isCheckingOut = false,
  discount = 0,
  couponCode,
}: CartSummaryProps) {
  const t = useTranslations("cart");
  const tLoading = useTranslations("loading");
  const total = Math.max(0, subtotal - discount);

  return (
    <div
      className={`${themed.bgPrimary} ${borderRadius.xl} border ${themed.border} p-5 space-y-4 sticky top-20`}
    >
      <h2 className={`text-base font-bold ${themed.textPrimary}`}>
        {t("orderSummary")}
      </h2>

      {/* Line items */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className={themed.textSecondary}>
            {t("itemsSubtotal")} ({t("itemCount", { count: itemCount })})
          </span>
          <span className={themed.textPrimary}>{formatCurrency(subtotal)}</span>
        </div>
        {discount > 0 && couponCode && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-emerald-600 dark:text-emerald-400">
              {t("discount")} ({couponCode})
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              -{formatCurrency(discount)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className={themed.textSecondary}>{t("shipping")}</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {t("shippingCalculated")}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className={themed.textSecondary}>{t("tax")}</span>
          <span className={themed.textSecondary}>{t("taxCalculated")}</span>
        </div>
      </div>

      {/* Divider */}
      <div className={`border-t ${themed.border}`} />

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className={`font-bold ${themed.textPrimary}`}>{t("total")}</span>
        <span className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
          {formatCurrency(total)}
        </span>
      </div>

      {/* CTA */}
      <button
        onClick={onCheckout}
        disabled={isCheckingOut || itemCount === 0}
        className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors text-sm"
      >
        {isCheckingOut ? tLoading("default") : t("checkout")}
      </button>

      {/* Continue shopping */}
      <Link
        href={ROUTES.PUBLIC.PRODUCTS}
        className={`block text-center text-sm ${themed.textSecondary} hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors`}
      >
        ← {t("continueShopping")}
      </Link>
    </div>
  );
}
