"use client";

import { useTranslations } from "next-intl";
import { Heading, Span, Text } from "@mohasinac/appkit/ui";
import type { ProductItem } from "@mohasinac/appkit/features/products";

interface BuyMoreSaveMoreProps {
  product: ProductItem;
  currentQty?: number;
}

/**
 * BuyMoreSaveMore — horizontal tier row showing bulk discount tiers.
 * Highlights the active tier based on `currentQty`.
 * Renders nothing when `product.bulkDiscounts` is empty or absent.
 */
export function BuyMoreSaveMore({
  product,
  currentQty = 1,
}: BuyMoreSaveMoreProps) {
  const t = useTranslations("products");

  if (!product.bulkDiscounts?.length) return null;

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900">
      <Heading level={3} className="text-sm font-semibold mb-3">
        {t("bulkDiscountTitle")}
      </Heading>
      <div className="flex flex-wrap gap-2">
        {product.bulkDiscounts.map((tier) => {
          const isActive = currentQty >= tier.quantity;
          return (
            <div
              key={tier.quantity}
              className={[
                "rounded-xl border-2 p-3 text-center min-w-[80px] flex-1",
                isActive
                  ? "border-primary bg-primary/5 dark:bg-primary/10"
                  : "border-zinc-200 dark:border-slate-700",
              ].join(" ")}
            >
              <Text
                className={`text-sm font-semibold ${isActive ? "text-primary-700 dark:text-primary" : ""}`}
              >
                {t("bulkDiscountBuy", { qty: tier.quantity })}
              </Text>
              <Span
                className={`text-xs ${isActive ? "text-primary-700/80 dark:text-primary/80" : "text-zinc-500 dark:text-zinc-400"}`}
              >
                {t("bulkDiscountSave", { pct: tier.discountPercent })}
              </Span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
