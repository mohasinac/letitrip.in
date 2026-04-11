"use client";
// Thin adapter — layout lives in @mohasinac/appkit
import { useTranslations } from "next-intl";
import { Lock, Globe, KeyRound, Database } from "lucide-react";
import { ROUTES } from "@/constants";
import { SecurityHighlightsSection as AppkitSecurityHighlightsSection } from "@mohasinac/appkit/features/homepage";
import type { SecurityHighlightItem } from "@mohasinac/appkit/features/homepage";

const ICON_MAP = { Lock, Globe, KeyRound, Database } as const;
type IconName = keyof typeof ICON_MAP;

const ITEM_CONFIGS = [
  {
    key: "encryption",
    iconName: "Lock" as IconName,
    titleKey: "securityEncryptionTitle",
    descKey: "securityEncryptionDesc",
    colorClass:
      "bg-primary/5 border-primary/20 dark:bg-primary/10 dark:border-primary/30",
    iconColorClass: "text-primary",
  },
  {
    key: "transport",
    iconName: "Globe" as IconName,
    titleKey: "securityTransportTitle",
    descKey: "securityTransportDesc",
    colorClass:
      "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700",
    iconColorClass: "text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "access",
    iconName: "KeyRound" as IconName,
    titleKey: "securityAccessTitle",
    descKey: "securityAccessDesc",
    colorClass:
      "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700",
    iconColorClass: "text-amber-600 dark:text-amber-400",
  },
  {
    key: "data",
    iconName: "Database" as IconName,
    titleKey: "securityDataTitle",
    descKey: "securityDataDesc",
    colorClass:
      "bg-sky-50 border-sky-200 dark:bg-sky-900/20 dark:border-sky-700",
    iconColorClass: "text-sky-600 dark:text-sky-400",
  },
];

export function SecurityHighlightsSection() {
  const t = useTranslations("homepage");

  const items: SecurityHighlightItem[] = ITEM_CONFIGS.map((cfg) => ({
    key: cfg.key,
    title: t(cfg.titleKey as Parameters<typeof t>[0]),
    description: t(cfg.descKey as Parameters<typeof t>[0]),
    colorClass: cfg.colorClass,
    iconColorClass: cfg.iconColorClass,
    renderIcon: ({ className }: { className?: string }) => {
      const Icon = ICON_MAP[cfg.iconName];
      return <Icon className={className ?? "w-6 h-6"} strokeWidth={1.5} />;
    },
  }));

  return (
    <AppkitSecurityHighlightsSection
      title={t("securityTitle")}
      subtitle={t("securitySubtitle")}
      pillLabel={t("securityPill")}
      learnMoreHref={ROUTES.PUBLIC.CONTACT}
      learnMoreLabel={t("securityLearnMore")}
      items={items}
    />
  );
}
