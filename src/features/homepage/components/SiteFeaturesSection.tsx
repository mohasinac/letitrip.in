"use client";
// Thin adapter — layout lives in @mohasinac/appkit
import { useTranslations } from "next-intl";
import { SiteFeaturesSection as AppkitSiteFeaturesSection } from "@mohasinac/appkit/features/homepage";
import { SITE_FEATURES } from "@/constants";

export function SiteFeaturesSection() {
  const t = useTranslations("homepage");
  return (
    <AppkitSiteFeaturesSection
      title={t("featuresTitle")}
      subtitle={t("featuresSubtitle")}
      features={SITE_FEATURES}
    />
  );
}

