"use client";

import Link from "next/link";
import { Card } from "@/components/ui";
import { ROUTES, UI_LABELS, THEME_CONSTANTS } from "@/constants";
import { formatCurrency } from "@/utils";

const { themed, spacing, typography } = THEME_CONSTANTS;
const LABELS = UI_LABELS.SELLER_ANALYTICS;

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
  return (
    <Card className="p-6">
      <div className={spacing.stack}>
        <h2 className={`${typography.h4} ${themed.textPrimary}`}>
          {LABELS.TOP_PRODUCTS_TITLE}
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
                    {p.orders} {LABELS.ORDERS_LABEL}
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
              {LABELS.NO_DATA}
            </p>
            <p className={`text-xs ${themed.textSecondary}`}>
              {LABELS.NO_DATA_DESC}
            </p>
            <Link
              href={ROUTES.SELLER.PRODUCTS}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {LABELS.VIEW_PRODUCTS}
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}
