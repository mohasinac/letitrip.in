"use client";

import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import { formatNumber } from "@/utils";

const { themed } = THEME_CONSTANTS;

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

interface FeatureBadge {
  key: string;
  icon: string;
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
}: ProductFeatureBadgesProps) {
  const t = useTranslations("products");

  const badges: FeatureBadge[] = [];

  if (featured) {
    badges.push({
      key: "featured",
      icon: "★",
      label: t("featured"),
      colorClass: "text-amber-700 dark:text-amber-300",
      bgClass:
        "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800",
    });
  }

  if (fasterDelivery) {
    badges.push({
      key: "fasterDelivery",
      icon: "⚡",
      label: t("fasterDelivery"),
      colorClass: "text-orange-700 dark:text-orange-300",
      bgClass:
        "bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800",
    });
  }

  if (ratedSeller) {
    badges.push({
      key: "ratedSeller",
      icon: "✓",
      label: t("ratedSeller"),
      colorClass: "text-primary",
      bgClass: "bg-primary/5 dark:bg-primary/10 border-primary/20",
    });
  }

  if (condition) {
    const conditionLabel =
      condition === "new"
        ? t("conditionNew")
        : condition === "used"
          ? t("conditionUsed")
          : condition === "broken"
            ? t("conditionBroken")
            : condition === "refurbished"
              ? t("conditionRefurbished")
              : t("conditionNew");

    badges.push({
      key: "condition",
      icon: "▣",
      label: `${t("condition")}: ${conditionLabel}`,
      colorClass: "text-primary",
      bgClass:
        "bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30",
    });
  }

  if (returnable && condition === "new") {
    badges.push({
      key: "returnable",
      icon: "↺",
      label: t("returnable"),
      colorClass: "text-teal-700 dark:text-teal-300",
      bgClass:
        "bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-800",
    });
  }

  if (freeShipping) {
    badges.push({
      key: "freeShipping",
      icon: "🚚",
      label: t("freeShipping"),
      colorClass: "text-emerald-700 dark:text-emerald-300",
      bgClass:
        "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800",
    });
  }

  if (codAvailable) {
    badges.push({
      key: "cod",
      icon: "₹",
      label: t("codAvailable"),
      colorClass: "text-purple-700 dark:text-purple-300",
      bgClass:
        "bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800",
    });
  }

  if (wishlistCount && wishlistCount > 0) {
    badges.push({
      key: "wishlist",
      icon: "♥",
      label: t("wishlistCount", { count: wishlistCount }),
      colorClass: "text-pink-700 dark:text-pink-300",
      bgClass:
        "bg-pink-50 dark:bg-pink-900/30 border-pink-200 dark:border-pink-800",
    });
  }

  if (categoryProductCount && categoryProductCount > 0 && categoryName) {
    badges.push({
      key: "categoryCount",
      icon: "▦",
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
        <span
          key={badge.key}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${badge.bgClass} ${badge.colorClass}`}
        >
          <span aria-hidden="true">{badge.icon}</span>
          {badge.label}
        </span>
      ))}
    </div>
  );
}
