"use client";

import { ProductFeatureBadges as BaseProductFeatureBadges } from "@mohasinac/feat-products";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import { formatNumber } from "@/utils";
const { themed } = THEME_CONSTANTS;

interface ProductFeatureBadgesProps {
  /** Is this product featured / promoted? */
  featured?: boolean;
  /** Does the seller offer faster delivery? */
  fasterDelivery?: boolean;
  /** Is this seller top-rated? */
  ratedSeller?: boolean;
  /** Product condition: new, used, broken, refurbished */
  condition?: string;
  /** Is this product returnable? (only for new items) */
  returnable?: boolean;
  /** Does the seller offer free shipping? */
  freeShipping?: boolean;
  /** Number of users who wishlisted this */
  wishlistCount?: number;
  /** Number of products in the same category */
  categoryProductCount?: number;
  /** Category name (for display alongside count) */
  categoryName?: string;
  /** Does the seller accept cash on delivery? */
  codAvailable?: boolean;
  /** Is this an auction product? */
  isAuction?: boolean;
}

export function ProductFeatureBadges({
  featured,
  fasterDelivery,
  ratedSeller,
  condition,
  returnable,
  freeShipping,
  wishlistCount,
  categoryProductCount,
  categoryName,
  codAvailable,
}: ProductFeatureBadgesProps) {
  const t = useTranslations("products");

  return (
    <BaseProductFeatureBadges
      featured={featured}
      fasterDelivery={fasterDelivery}
      ratedSeller={ratedSeller}
      condition={condition}
      returnable={returnable}
      freeShipping={freeShipping}
      wishlistCount={wishlistCount}
      categoryProductCount={categoryProductCount}
      categoryName={categoryName}
      codAvailable={codAvailable}
      labels={{
        featured: t("featured"),
        fasterDelivery: t("fasterDelivery"),
        ratedSeller: t("ratedSeller"),
        condition: t("condition"),
        conditionNew: t("conditionNew"),
        conditionUsed: t("conditionUsed"),
        conditionBroken: t("conditionBroken"),
        conditionRefurbished: t("conditionRefurbished"),
        returnable: t("returnable"),
        freeShipping: t("freeShipping"),
        codAvailable: t("codAvailable"),
        wishlistCount: (count) => t("wishlistCount", { count }),
        categoryProductCount: (count, category) =>
          t("categoryProductCount", { count, category }),
      }}
      formatCount={formatNumber}
      categoryBadgeClassName={`${themed.bgSecondary} ${themed.border}`}
    />
  );
}
