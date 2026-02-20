"use client";

import { useState } from "react";
import { useApiQuery } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS, UI_LABELS, THEME_CONSTANTS } from "@/constants";
import { Card, Button, Spinner, ProductCard } from "@/components";
import { formatCurrency, formatDate } from "@/utils";
import type { ProductDocument, CouponDocument } from "@/db/schema";

const LABELS = UI_LABELS.PROMOTIONS_PAGE;
const { themed, typography, spacing } = THEME_CONSTANTS;

interface PromotionsData {
  promotedProducts: ProductDocument[];
  featuredProducts: ProductDocument[];
  activeCoupons: CouponDocument[];
}

function getDiscountLabel(coupon: CouponDocument): string {
  switch (coupon.type) {
    case "percentage":
      return `${coupon.discount.value}% ${LABELS.OFF}`;
    case "fixed":
      return `${formatCurrency(coupon.discount.value)} ${LABELS.FLAT_OFF}`;
    case "free_shipping":
      return LABELS.FREE_SHIPPING;
    case "buy_x_get_y":
      return "Buy X Get Y";
    default:
      return "Special Offer";
  }
}

function CouponCard({ coupon }: { coupon: CouponDocument }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text
    }
  };

  return (
    <Card className="p-5 border-2 border-dashed border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className={`font-semibold ${themed.textPrimary} text-base`}>
            {coupon.name}
          </h3>
          <p className="text-indigo-600 dark:text-indigo-400 font-bold text-lg mt-0.5">
            {getDiscountLabel(coupon)}
          </p>
        </div>
        <span className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 px-2 py-0.5 rounded-full text-xs font-medium">
          Active
        </span>
      </div>

      {coupon.description && (
        <p className={`text-sm ${themed.textSecondary} mb-3`}>
          {coupon.description}
        </p>
      )}

      {coupon.discount.minPurchase && (
        <p className={`text-xs ${themed.textSecondary} mb-3`}>
          Min. order: {formatCurrency(coupon.discount.minPurchase)}
        </p>
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
          {copied ? LABELS.COPIED : LABELS.COPY_CODE}
        </Button>
      </div>

      {coupon.validity.endDate && (
        <p className={`text-xs ${themed.textSecondary} mt-2 text-right`}>
          {LABELS.VALID_UNTIL} {formatDate(coupon.validity.endDate)}
        </p>
      )}
    </Card>
  );
}

function ProductSection({
  title,
  subtitle,
  products,
}: {
  title: string;
  subtitle: string;
  products: ProductDocument[];
}) {
  if (products.length === 0) return null;

  return (
    <section>
      <div className="mb-6">
        <h2 className={`${typography.h3} ${themed.textPrimary}`}>{title}</h2>
        <p className={`mt-1 ${themed.textSecondary}`}>{subtitle}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default function PromotionsPage() {
  const { data, isLoading, error } = useApiQuery<PromotionsData>({
    queryKey: ["promotions"],
    queryFn: () => apiClient.get(API_ENDPOINTS.PROMOTIONS.LIST),
  });

  const promotedProducts = data?.promotedProducts || [];
  const featuredProducts = data?.featuredProducts || [];
  const activeCoupons = data?.activeCoupons || [];
  const hasContent =
    promotedProducts.length > 0 ||
    featuredProducts.length > 0 ||
    activeCoupons.length > 0;

  return (
    <div className={`min-h-screen ${themed.bgPrimary}`}>
      {/* Hero */}
      <div className="bg-gradient-to-br from-rose-500 via-pink-600 to-orange-500 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-rose-100 font-medium mb-2 uppercase tracking-widest text-sm">
            🎉 Exclusive Offers
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {LABELS.TITLE}
          </h1>
          <p className="text-lg text-rose-100 max-w-2xl mx-auto">
            {LABELS.SUBTITLE}
          </p>
        </div>
      </div>

      <div
        className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${spacing.stack}`}
      >
        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <p className={`${themed.textSecondary}`}>
              {UI_LABELS.LOADING.FAILED}
            </p>
          </div>
        )}

        {!isLoading && !error && !hasContent && (
          <div className="text-center py-16">
            <p className={`${typography.h4} ${themed.textPrimary} mb-2`}>
              {LABELS.EMPTY_DEALS}
            </p>
            <p className={`${themed.textSecondary}`}>{LABELS.CHECK_BACK}</p>
          </div>
        )}

        {!isLoading && !error && hasContent && (
          <div className={spacing.stack}>
            {/* Active Coupons */}
            {activeCoupons.length > 0 && (
              <section>
                <div className="mb-6">
                  <h2 className={`${typography.h3} ${themed.textPrimary}`}>
                    {LABELS.COUPONS_TITLE}
                  </h2>
                  <p className={`mt-1 ${themed.textSecondary}`}>
                    {LABELS.COUPONS_SUBTITLE}
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeCoupons.map((coupon) => (
                    <CouponCard key={coupon.id} coupon={coupon} />
                  ))}
                </div>
              </section>
            )}

            {activeCoupons.length === 0 && (
              <section>
                <div className="mb-6">
                  <h2 className={`${typography.h3} ${themed.textPrimary}`}>
                    {LABELS.COUPONS_TITLE}
                  </h2>
                </div>
                <p className={`${themed.textSecondary} text-sm`}>
                  {LABELS.EMPTY_COUPONS}
                </p>
              </section>
            )}

            {/* Promoted Products */}
            <ProductSection
              title={LABELS.DEALS_TITLE}
              subtitle={LABELS.DEALS_SUBTITLE}
              products={promotedProducts}
            />

            {/* Featured Products */}
            <ProductSection
              title={LABELS.FEATURED_TITLE}
              subtitle={LABELS.FEATURED_SUBTITLE}
              products={featuredProducts}
            />
          </div>
        )}
      </div>
    </div>
  );
}
