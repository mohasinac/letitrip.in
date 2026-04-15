"use client";
// Thin adapter — layout lives in @mohasinac/appkit
import { useTranslations } from "next-intl";
import { Search, Gavel, PackageCheck } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/constants";
import { HowItWorksSection as AppkitHowItWorksSection } from "@mohasinac/appkit/features/homepage";
import type { HowItWorksStep } from "@mohasinac/appkit/features/homepage";

const ICON_MAP = { Search, Gavel, PackageCheck } as const;
type IconName = keyof typeof ICON_MAP;

const STEP_CONFIGS = [
  {
    number: 1,
    iconName: "Search" as IconName,
    titleKey: "howItWorksStep1Title",
    descKey: "howItWorksStep1Desc",
    accentFrom: "from-primary to-primary/80",
    iconColor: "text-primary",
    iconBg: "bg-primary/5 dark:bg-primary/10",
    badgeBg: "bg-primary",
  },
  {
    number: 2,
    iconName: "Gavel" as IconName,
    titleKey: "howItWorksStep2Title",
    descKey: "howItWorksStep2Desc",
    accentFrom: "from-violet-500 to-purple-600",
    iconColor: "text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-50 dark:bg-violet-950/40",
    badgeBg: "bg-violet-600",
  },
  {
    number: 3,
    iconName: "PackageCheck" as IconName,
    titleKey: "howItWorksStep3Title",
    descKey: "howItWorksStep3Desc",
    accentFrom: "from-emerald-500 to-teal-600",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    badgeBg: "bg-emerald-600",
  },
] as const;

export function HowItWorksSection() {
  const t = useTranslations("homepage");
  const router = useRouter();

  const steps: HowItWorksStep[] = STEP_CONFIGS.map((cfg) => ({
    number: cfg.number,
    title: t(cfg.titleKey as Parameters<typeof t>[0]),
    desc: t(cfg.descKey as Parameters<typeof t>[0]),
    accentFrom: cfg.accentFrom,
    iconColor: cfg.iconColor,
    iconBg: cfg.iconBg,
    badgeBg: cfg.badgeBg,
    renderIcon: ({ className }: { className?: string }) => {
      const Icon = ICON_MAP[cfg.iconName];
      return <Icon className={className ?? "w-6 h-6"} />;
    },
  }));

  return (
    <AppkitHowItWorksSection
      title={t("howItWorksTitle")}
      subtitle={t("howItWorksSubtitle")}
      pillLabel={t("howItWorksPill")}
      ctaLabel={t("howItWorksCta")}
      onCtaClick={() => router.push(ROUTES.PUBLIC.PRODUCTS)}
      steps={steps}
    />
  );
}

