"use client";

import { Card, Heading, Span, Text, TextLink } from "@/components";
import { useTranslations } from "next-intl";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { formatCurrency } from "@/utils";

const { themed, spacing } = THEME_CONSTANTS;

export interface TopProduct {
  productId: string;
  title: string;
  revenue: number;
  orders: number;
  mainImage: string;
}

interface SellerTopProductsProps {
  products: TopProduct[];
}

export function SellerTopProducts({ products }: SellerTopProductsProps) {
  const t = useTranslations("sellerAnalytics");
  return (
    <Card className="p-6">
      <div className={spacing.stack}>
        <Heading level={2}>{t("topProductsTitle")}</Heading>
        {products.length > 0 ? (
          <div className="divide-y divide-zinc-100 dark:divide-slate-800">
            {products.map((p, i) => (
              <div key={p.productId} className="flex items-center gap-4 py-3">
                <Span
                  className={`w-6 text-sm font-bold ${themed.textSecondary}`}
                >
                  {i + 1}.
                </Span>
                <div className="flex-1 min-w-0">
                  <Text size="sm" weight="medium">
                    {p.title}
                  </Text>
                  <Text size="xs" variant="secondary">
                    {p.orders} {t("ordersLabel")}
                  </Text>
                </div>
                <Span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(p.revenue)}
                </Span>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-8 ${spacing.stack}`}>
            <Text size="sm" weight="medium">
              {t("noData")}
            </Text>
            <Text size="xs" variant="secondary">
              {t("noDataDesc")}
            </Text>
            <TextLink
              href={ROUTES.SELLER.PRODUCTS}
              className="text-sm text-primary hover:underline"
            >
              {t("viewProducts")}
            </TextLink>
          </div>
        )}
      </div>
    </Card>
  );
}
