"use client";

import { useState } from "react";
import { Button, Card, Heading, Span, Text } from "@/components";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import { formatCurrency, formatDate } from "@/utils";
import type { CouponDocument } from "@/db/schema";

const { themed, flex } = THEME_CONSTANTS;

export function CouponCard({ coupon }: { coupon: CouponDocument }) {
  const t = useTranslations("promotions");
  const [copied, setCopied] = useState(false);

  function getDiscountLabel(c: CouponDocument): string {
    switch (c.type) {
      case "percentage":
        return `${c.discount.value}% ${t("off")}`;
      case "fixed":
        return `${formatCurrency(c.discount.value)} ${t("flatOff")}`;
      case "free_shipping":
        return t("freeShipping");
      case "buy_x_get_y":
        return t("buyXGetY");
      default:
        return t("specialOffer");
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: no-op
    }
  };

  return (
    <Card className="p-5 border-2 border-dashed border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors">
      <div className={`${flex.betweenStart} mb-3`}>
        <div>
          <Heading level={3}>{coupon.name}</Heading>
          <Text className="text-indigo-600 dark:text-indigo-400 font-bold text-lg mt-0.5">
            {getDiscountLabel(coupon)}
          </Text>
        </div>
        <Span className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 px-2 py-0.5 rounded-full text-xs font-medium">
          {t("statusActive")}
        </Span>
      </div>

      {coupon.description && (
        <Text size="sm" variant="secondary" className="mb-3">
          {coupon.description}
        </Text>
      )}

      {coupon.discount.minPurchase && (
        <Text size="xs" variant="secondary" className="mb-3">
          Min. order: {formatCurrency(coupon.discount.minPurchase)}
        </Text>
      )}

      <div className="flex items-center gap-2">
        <code
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-mono font-bold tracking-widest ${themed.bgSecondary} ${themed.textPrimary} text-center`}
        >
          {coupon.code}
        </code>
        <Button
          variant="primary"
          onClick={handleCopy}
          className="shrink-0 text-sm px-3 py-2"
        >
          {copied ? t("copied") : t("copyCode")}
        </Button>
      </div>

      {coupon.validity.endDate && (
        <Text size="xs" variant="secondary" className="mt-2 text-right">
          {t("validUntil")} {formatDate(coupon.validity.endDate)}
        </Text>
      )}
    </Card>
  );
}
