"use client";

import { useTranslations } from "next-intl";
import { Truck, RefreshCw, ShieldCheck } from "lucide-react";
import { Text, Row } from "@mohasinac/appkit/ui";

interface PromoBannerStripProps {
  /** Free-shipping threshold in rupees. Defaults to 499. */
  shippingThreshold?: number;
}

const CHIPS = [
  { icon: Truck, key: "promoFreeShipping" as const },
  { icon: RefreshCw, key: "promoEasyReturns" as const },
  { icon: ShieldCheck, key: "promoAuthentic" as const },
] as const;

/**
 * PromoBannerStrip — 3 icon chips (free shipping, easy returns, authentic)
 * placed as a thin trust bar on the product detail page.
 */
export function PromoBannerStrip({
  shippingThreshold = 499,
}: PromoBannerStripProps) {
  const t = useTranslations("products");

  return (
    <Row
      wrap
      justify="center"
      gap="md"
      className="py-4 border-y border-zinc-100 dark:border-slate-800"
    >
      {CHIPS.map(({ icon: Icon, key }) => (
        <Row
          key={key}
          gap="sm"
          className="text-sm text-zinc-600 dark:text-zinc-400"
        >
          <Icon
            className="w-4 h-4 text-primary"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <Text size="sm">
            {key === "promoFreeShipping"
              ? t(key, { threshold: shippingThreshold })
              : t(key)}
          </Text>
        </Row>
      ))}
    </Row>
  );
}

