"use client";

import { useTranslations } from "next-intl";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { formatCurrency } from "@/utils";
import { Button, Heading, Span, TextLink } from "@/components";

const { themed, borderRadius, flex } = THEME_CONSTANTS;

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
      <Heading level={2} className="text-base font-bold">
        {t("orderSummary")}
      </Heading>

      {/* Line items */}
      <div className="space-y-2">
        <div className={`${flex.between} text-sm`}>
          <Span className={themed.textSecondary}>
            {t("itemsSubtotal")} ({t("itemCount", { count: itemCount })})
          </Span>
          <Span className={themed.textPrimary}>{formatCurrency(subtotal)}</Span>
        </div>
        {discount > 0 && couponCode && (
          <div className={`${flex.between} text-sm`}>
            <Span className="text-emerald-600 dark:text-emerald-400">
              {t("discount")} ({couponCode})
            </Span>
            <Span className="text-emerald-600 dark:text-emerald-400 font-medium">
              -{formatCurrency(discount)}
            </Span>
          </div>
        )}
        <div className={`${flex.between} text-sm`}>
          <Span className={themed.textSecondary}>{t("shipping")}</Span>
          <Span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {t("shippingCalculated")}
          </Span>
        </div>
        <div className={`${flex.between} text-sm`}>
          <Span className={themed.textSecondary}>{t("tax")}</Span>
          <Span className={themed.textSecondary}>{t("taxCalculated")}</Span>
        </div>
      </div>

      {/* Divider */}
      <div className={`border-t ${themed.border}`} />

      {/* Total */}
      <div className={flex.between}>
        <Span className={`font-bold ${themed.textPrimary}`}>{t("total")}</Span>
        <Span className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
          {formatCurrency(total)}
        </Span>
      </div>

      {/* CTA */}
      <Button
        variant="primary"
        onClick={onCheckout}
        disabled={isCheckingOut || itemCount === 0}
        isLoading={isCheckingOut}
        className="w-full"
      >
        {isCheckingOut ? tLoading("default") : t("checkout")}
      </Button>

      {/* Continue shopping */}
      <TextLink
        href={ROUTES.PUBLIC.PRODUCTS}
        variant="muted"
        className="block text-center text-sm"
      >
        ← {t("continueShopping")}
      </TextLink>
    </div>
  );
}
