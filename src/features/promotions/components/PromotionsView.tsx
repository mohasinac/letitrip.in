import { THEME_CONSTANTS } from "@/constants";
import { getTranslations } from "next-intl/server";
import { CouponCard, ProductSection } from "@/features/promotions";
import { Heading, Text, Section } from "@/components";
import type { ProductDocument, CouponDocument } from "@/db/schema";

const { themed, typography, spacing, page } = THEME_CONSTANTS;

interface PromotionsViewProps {
  promotedProducts: ProductDocument[];
  featuredProducts: ProductDocument[];
  activeCoupons: CouponDocument[];
}

export async function PromotionsView({
  promotedProducts,
  featuredProducts,
  activeCoupons,
}: PromotionsViewProps) {
  const t = await getTranslations("promotions");

  const hasContent =
    promotedProducts.length > 0 ||
    featuredProducts.length > 0 ||
    activeCoupons.length > 0;

  return (
    <div className={`min-h-screen ${themed.bgPrimary}`}>
      {/* Hero */}
      <div
        className={`${THEME_CONSTANTS.accentBanner.promotionHero} text-white py-16`}
      >
        <div className={`${page.container.lg} text-center`}>
          <Text className="text-white font-medium mb-2 uppercase tracking-widest text-sm">
            🎉 {t("exclusiveOffersBadge")}
          </Text>
          <Heading level={1} className="mb-4">
            {t("title")}
          </Heading>
          <Text className="text-lg text-white/90 max-w-2xl mx-auto">
            {t("subtitle")}
          </Text>
        </div>
      </div>

      <div className={`${page.container.lg} py-12 ${spacing.stack}`}>
        {!hasContent && (
          <div className="text-center py-16">
            <Heading level={2} className={`${typography.h4} mb-2`}>
              {t("emptyDeals")}
            </Heading>
            <Text variant="secondary">{t("checkBack")}</Text>
          </div>
        )}

        {hasContent && (
          <div className={spacing.stack}>
            {/* Active Coupons */}
            <Section>
              <div className="mb-6">
                <Heading level={2} className={`${typography.h3}`}>
                  {t("couponsTitle")}
                </Heading>
                {activeCoupons.length > 0 && (
                  <Text variant="secondary" className="mt-1">
                    {t("couponsSubtitle")}
                  </Text>
                )}
              </div>
              {activeCoupons.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
                  {activeCoupons.map((coupon) => (
                    <CouponCard key={coupon.id} coupon={coupon} />
                  ))}
                </div>
              ) : (
                <Text variant="secondary" size="sm">
                  {t("emptyCoupons")}
                </Text>
              )}
            </Section>

            {/* Promoted Products */}
            <ProductSection
              title={t("dealsTitle")}
              subtitle={t("dealsSubtitle")}
              products={promotedProducts}
            />

            {/* Featured Products */}
            <ProductSection
              title={t("featuredTitle")}
              subtitle={t("featuredSubtitle")}
              products={featuredProducts}
            />
          </div>
        )}
      </div>
    </div>
  );
}
