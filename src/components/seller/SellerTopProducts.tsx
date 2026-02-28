"use client";

import Link from "next/link";
import { Card } from "@/components/ui";
import { useTranslations } from "next-intl";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { formatCurrency } from "@/utils";

const { themed, spacing, typography } = THEME_CONSTANTS;

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
        <h2 className={`${typography.h4} ${themed.textPrimary}`}>
          {t("topProductsTitle")}
        </h2>
        {products.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {products.map((p, i) => (
              <div key={p.productId} className="flex items-center gap-4 py-3">
                <span
                  className={`w-6 text-sm font-bold ${themed.textSecondary}`}
                >
                  {i + 1}.
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${themed.textPrimary} truncate`}
                  >
                    {p.title}
                  </p>
                  <p className={`text-xs ${themed.textSecondary}`}>
                    {p.orders} {t("ordersLabel")}
                  </p>
                </div>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(p.revenue)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-8 ${spacing.stack}`}>
            <p className={`text-sm font-medium ${themed.textPrimary}`}>
              {t("noData")}
            </p>
            <p className={`text-xs ${themed.textSecondary}`}>
              {t("noDataDesc")}
            </p>
            <Link
              href={ROUTES.SELLER.PRODUCTS}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {t("viewProducts")}
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}
