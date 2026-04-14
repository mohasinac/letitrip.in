"use client";

import { useTranslations } from "next-intl";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { formatCurrency } from "@/utils";
import { Heading, Span, Button, Div, Row, Stack } from "@mohasinac/appkit/ui";
import { TextLink } from "@/components";

const { themed, flex, spacing } = THEME_CONSTANTS;

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
    <Div
      className={`${themed.bgPrimary} rounded-xl border ${themed.border} p-5 ${spacing.stack} sticky top-20`}
    >
      <Heading level={2} className="text-base font-bold">
        {t("orderSummary")}
      </Heading>

      {/* Line items */}
      <Stack gap="sm">
        <Row justify="between" className="text-sm">
          <Span className={themed.textSecondary}>
            {t("itemsSubtotal")} ({t("itemCount", { count: itemCount })})
          </Span>
          <Span className={themed.textPrimary}>{formatCurrency(subtotal)}</Span>
        </Row>
        {discount > 0 && couponCode && (
          <Row justify="between" className="text-sm">
            <Span className="text-emerald-600 dark:text-emerald-400">
              {t("discount")} ({couponCode})
            </Span>
            <Span className="text-emerald-600 dark:text-emerald-400 font-medium">
              -{formatCurrency(discount)}
            </Span>
          </Row>
        )}
        <Row justify="between" className="text-sm">
          <Span className={themed.textSecondary}>{t("shipping")}</Span>
          <Span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {t("shippingCalculated")}
          </Span>
        </Row>
        <Row justify="between" className="text-sm">
          <Span className={themed.textSecondary}>{t("tax")}</Span>
          <Span className={themed.textSecondary}>{t("taxCalculated")}</Span>
        </Row>
      </Stack>

      {/* Divider */}
      <Div className={`border-t ${themed.border}`} />

      {/* Total */}
      <Row justify="between">
        <Span className={`font-bold ${themed.textPrimary}`}>{t("total")}</Span>
        <Span className="font-bold text-lg text-primary">
          {formatCurrency(total)}
        </Span>
      </Row>

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
    </Div>
  );
}
