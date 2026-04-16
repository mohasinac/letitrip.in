"use client";

import { proseMirrorToHtml } from "@mohasinac/appkit/utils";
import type { CouponDocument, CouponType } from "@/db/schema";

import { useState } from "react";
import { Gift, Percent, Truck, Tag } from "lucide-react";
import { useMessage } from "@/hooks";
import { Heading, Text, Span, Button, RichText } from "@mohasinac/appkit/ui";
import { Card } from "@/components";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS, ERROR_MESSAGES } from "@/constants";
import { formatCurrency, formatDate } from "@mohasinac/appkit/utils";

const { themed, flex } = THEME_CONSTANTS;

const COUPON_TYPE_CONFIG: Record<
  CouponType,
  {
    Icon: React.FC<{ className?: string }>;
    className: string;
    labelKey: string;
  }
> = {
  percentage: {
    Icon: Percent,
    className:
      "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    labelKey: "typePercentage",
  },
  fixed: {
    Icon: Tag,
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    labelKey: "typeFixed",
  },
  free_shipping: {
    Icon: Truck,
    className:
      "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
    labelKey: "freeShipping",
  },
  buy_x_get_y: {
    Icon: Gift,
    className:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    labelKey: "buyXGetY",
  },
};

export function CouponCard({ coupon }: { coupon: CouponDocument }) {
  const t = useTranslations("promotions");
  const { showError } = useMessage();
  const [copied, setCopied] = useState(false);

  const typeConfig = COUPON_TYPE_CONFIG[coupon.type];
  const TypeIcon = typeConfig.Icon;

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
      showError(ERROR_MESSAGES.GENERIC.TRY_AGAIN);
    }
  };

  return (
    <Card className="p-5 border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
      <div className={`${flex.betweenStart} mb-3 gap-2`}>
        <div className="min-w-0 flex-1">
          <Heading level={4}>{coupon.name}</Heading>
          <Text className="text-primary font-bold text-base mt-0.5">
            {getDiscountLabel(coupon)}
          </Text>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${typeConfig.className}`}
          >
            <TypeIcon className="w-3 h-3 flex-shrink-0" />
            {t(typeConfig.labelKey as Parameters<typeof t>[0])}
          </Span>
          <Span className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 px-2 py-0.5 rounded-full text-xs font-medium">
            {t("statusActive")}
          </Span>
        </div>
      </div>

      {coupon.description && (
        <RichText
          html={proseMirrorToHtml(coupon.description)}
          copyableCode
          className="mb-3 text-sm"
        />
      )}

      {coupon.discount.minPurchase && (
        <Text size="xs" variant="secondary" className="mb-3">
          Min. order: {formatCurrency(coupon.discount.minPurchase)}
        </Text>
      )}

      <div className="flex items-center gap-2 min-w-0">
        <code
          className={`flex-1 min-w-0 truncate px-3 py-2 rounded-lg text-sm font-mono font-bold tracking-wide ${themed.bgSecondary} ${themed.textPrimary} text-center`}
        >
          {coupon.code}
        </code>
        <Button
          variant="primary"
          onClick={handleCopy}
          className="shrink-0 text-xs px-2 py-2 sm:text-xs sm:px-3"
        >
          <Span className="hidden sm:inline">
            {copied ? t("copied") : t("copyCode")}
          </Span>
          <Span className="sm:hidden">{copied ? "✓" : "Copy"}</Span>
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

