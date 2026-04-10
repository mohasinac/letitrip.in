"use client";

import { useTranslations } from "next-intl";
import { ProductFeatureBadges as AppkitProductFeatureBadges } from "@mohasinac/appkit/features/products";
import { formatNumber } from "@/utils";

interface ProductFeatureBadgesProps {
  featured?: boolean;
  fasterDelivery?: boolean;
  ratedSeller?: boolean;
  condition?: string;
  returnable?: boolean;
  freeShipping?: boolean;
  wishlistCount?: number;
  categoryProductCount?: number;
  categoryName?: string;
  codAvailable?: boolean;
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
    <AppkitProductFeatureBadges
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
        wishlistCount: (count: number) => t("wishlistCount", { count }),
        categoryProductCount: (count: string, category: string) =>
          t("categoryProductCount", { count, category }),
      }}
      formatCount={formatNumber}
    />
  );
}
