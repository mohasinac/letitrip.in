"use client";

import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import { formatNumber } from "@/utils";
import { Span, Text } from "@/components";
import {
  Star,
  Zap,
  ShieldCheck,
  RotateCcw,
  Truck,
  Heart,
  Package,
  CreditCard,
  Award,
} from "lucide-react";

const { flex, themed } = THEME_CONSTANTS;

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

interface FeatureBadge {
  key: string;
  icon: React.ReactNode;
  label: string;
  colorClass: string;
  bgClass: string;
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
  isAuction,
}: ProductFeatureBadgesProps) {
  const t = useTranslations("products");
  const badges: FeatureBadge[] = [];

  if (featured) {
    badges.push({
      key: "featured",
      icon: <Star className="w-4 h-4" />,
      label: t("featured"),
      colorClass: "text-amber-700 dark:text-amber-300",
      bgClass:
        "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800",
    });
  }

  if (fasterDelivery) {
    badges.push({
      key: "fasterDelivery",
      icon: <Zap className="w-4 h-4" />,
      label: t("fasterDelivery"),
      colorClass: "text-orange-700 dark:text-orange-300",
      bgClass:
        "bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800",
    });
  }

  if (ratedSeller) {
    badges.push({
      key: "ratedSeller",
      icon: <Award className="w-4 h-4" />,
      label: t("ratedSeller"),
      colorClass: "text-indigo-700 dark:text-indigo-300",
      bgClass:
        "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800",
    });
  }

  if (condition) {
    const conditionKey =
      condition === "new"
        ? "conditionNew"
        : condition === "used"
          ? "conditionUsed"
          : condition === "broken"
            ? "conditionBroken"
            : condition === "refurbished"
              ? "conditionRefurbished"
              : "conditionNew";
    badges.push({
      key: "condition",
      icon: <Package className="w-4 h-4" />,
      label: `${t("condition")}: ${t(conditionKey)}`,
      colorClass: "text-blue-700 dark:text-blue-300",
      bgClass:
        "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800",
    });
  }

  if (returnable && condition === "new") {
    badges.push({
      key: "returnable",
      icon: <RotateCcw className="w-4 h-4" />,
      label: t("returnable"),
      colorClass: "text-teal-700 dark:text-teal-300",
      bgClass:
        "bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-800",
    });
  }

  if (freeShipping) {
    badges.push({
      key: "freeShipping",
      icon: <Truck className="w-4 h-4" />,
      label: t("freeShipping"),
      colorClass: "text-emerald-700 dark:text-emerald-300",
      bgClass:
        "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800",
    });
  }

  if (codAvailable) {
    badges.push({
      key: "cod",
      icon: <CreditCard className="w-4 h-4" />,
      label: t("codAvailable"),
      colorClass: "text-purple-700 dark:text-purple-300",
      bgClass:
        "bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800",
    });
  }

  if (wishlistCount && wishlistCount > 0) {
    badges.push({
      key: "wishlist",
      icon: <Heart className="w-4 h-4" />,
      label: t("wishlistCount", { count: wishlistCount }),
      colorClass: "text-pink-700 dark:text-pink-300",
      bgClass:
        "bg-pink-50 dark:bg-pink-900/30 border-pink-200 dark:border-pink-800",
    });
  }

  if (categoryProductCount && categoryProductCount > 0 && categoryName) {
    badges.push({
      key: "categoryCount",
      icon: <ShieldCheck className="w-4 h-4" />,
      label: t("categoryProductCount", {
        count: formatNumber(categoryProductCount),
        category: categoryName,
      }),
      colorClass: "text-zinc-700 dark:text-zinc-300",
      bgClass: `${themed.bgSecondary} ${themed.border}`,
    });
  }

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <Span
          key={badge.key}
          className={`${flex.rowCenter} gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${badge.bgClass} ${badge.colorClass}`}
        >
          <Span aria-hidden="true">{badge.icon}</Span>
          {badge.label}
        </Span>
      ))}
    </div>
  );
}
