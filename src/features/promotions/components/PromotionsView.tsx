"use client";

import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import {
  PromotionsView as AppkitPromotionsView,
  PromotionsViewProductSection,
} from "@mohasinac/appkit/features/promotions";
import { CouponCard } from "@/features/promotions/components/CouponCard";
import {
  ProductCard,
  type ProductItem,
} from "@mohasinac/appkit/features/products";
import type { CouponDocument } from "@/db/schema";
import { Link } from "@/i18n/navigation";

interface PromotionsViewProps {
  promotedProducts: ProductItem[];
  featuredProducts: ProductItem[];
  activeCoupons: CouponDocument[];
}

export function PromotionsView({
  promotedProducts,
  featuredProducts,
  activeCoupons,
}: PromotionsViewProps) {
  const t = useTranslations("promotions");

  const hasContent =
    promotedProducts.length > 0 ||
    featuredProducts.length > 0 ||
    activeCoupons.length > 0;

  return (
    <AppkitPromotionsView
      hasContent={hasContent}
      heroBannerClass={THEME_CONSTANTS.accentBanner.promotionHero}
      couponsCount={activeCoupons.length}
      labels={{
        exclusiveOffersBadge: t("exclusiveOffersBadge"),
        title: t("title"),
        subtitle: t("subtitle"),
        emptyDeals: t("emptyDeals"),
        checkBack: t("checkBack"),
        couponsTitle: t("couponsTitle"),
        couponsSubtitle: t("couponsSubtitle"),
        emptyCoupons: t("emptyCoupons"),
        dealsTitle: t("dealsTitle"),
        dealsSubtitle: t("dealsSubtitle"),
        featuredTitle: t("featuredTitle"),
        featuredSubtitle: t("featuredSubtitle"),
      }}
      renderCoupons={() => (
        <div className={THEME_CONSTANTS.grid.couponCards}>
          {activeCoupons.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} />
          ))}
        </div>
      )}
      renderDealsSection={() => (
        <PromotionsViewProductSection
          title={t("dealsTitle")}
          subtitle={t("dealsSubtitle")}
          hasProducts={promotedProducts.length > 0}
          renderProducts={() => (
            <div className={THEME_CONSTANTS.grid.productCards}>
              {promotedProducts.map((product) => (
                <Link
                  key={product.id}
                  href={ROUTES.PUBLIC.PRODUCT_DETAIL(product.slug ?? product.id)}
                  className="block"
                >
                  <ProductCard product={product} className="h-full" />
                </Link>
              ))}
            </div>
          )}
        />
      )}
      renderFeaturedSection={() => (
        <PromotionsViewProductSection
          title={t("featuredTitle")}
          subtitle={t("featuredSubtitle")}
          hasProducts={featuredProducts.length > 0}
          renderProducts={() => (
            <div className={THEME_CONSTANTS.grid.productCards}>
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={ROUTES.PUBLIC.PRODUCT_DETAIL(product.slug ?? product.id)}
                  className="block"
                >
                  <ProductCard product={product} className="h-full" />
                </Link>
              ))}
            </div>
          )}
        />
      )}
    />
  );
}
