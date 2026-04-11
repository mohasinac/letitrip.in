"use client";
// Thin adapter — layout lives in @mohasinac/appkit
import { useTranslations } from "next-intl";
import { Package, Users, ShoppingBag, Star } from "lucide-react";
import { StatsCounterSection as AppkitStatsCounterSection } from "@mohasinac/appkit/features/homepage";
import type { StatItem } from "@mohasinac/appkit/features/homepage";

const ICON_MAP = { Package, Users, ShoppingBag, Star } as const;
type IconName = keyof typeof ICON_MAP;

const STAT_CONFIGS: Array<{
  iconName: IconName;
  valueKey: string;
  labelKey: string;
}> = [
  {
    iconName: "Package",
    valueKey: "statsProducts",
    labelKey: "statsProductsLabel",
  },
  {
    iconName: "Users",
    valueKey: "statsSellers",
    labelKey: "statsSellersLabel",
  },
  {
    iconName: "ShoppingBag",
    valueKey: "statsBuyers",
    labelKey: "statsBuyersLabel",
  },
  { iconName: "Star", valueKey: "statsRating", labelKey: "statsRatingLabel" },
];

export function StatsCounterSection() {
  const t = useTranslations("homepage");

  const stats: StatItem[] = STAT_CONFIGS.map((cfg) => ({
    key: cfg.iconName,
    value: t(cfg.valueKey as Parameters<typeof t>[0]),
    label: t(cfg.labelKey as Parameters<typeof t>[0]),
    renderIcon: ({ className }: { className?: string }) => {
      const Icon = ICON_MAP[cfg.iconName];
      return <Icon className={className ?? "w-7 h-7"} />;
    },
  }));

  return <AppkitStatsCounterSection stats={stats} />;
}
