"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useHomepageSections } from "@/hooks";
import { ROUTES } from "@/constants";
import {
  WelcomeSection as AppkitWelcomeSection,
  type WelcomeSectionChip,
} from "@mohasinac/appkit/features/homepage";
import type { WelcomeSectionConfig } from "@/db/schema";

// ─── Trust chip keys (order matters for display) ────────────────────────────
const TRUST_CHIP_KEYS = [
  "welcomeTrustDelivery",
  "welcomeTrustPayment",
  "welcomeTrustRating",
  "welcomeTrustReturns",
] as const;

const TRUST_CHIP_EMOJIS: Record<(typeof TRUST_CHIP_KEYS)[number], string> = {
  welcomeTrustDelivery: "🚀",
  welcomeTrustPayment: "🔒",
  welcomeTrustRating: "⭐",
  welcomeTrustReturns: "↩️",
};

// ─── Component ───────────────────────────────────────────────────────────────

export function WelcomeSection() {
  const t = useTranslations("homepage");
  const router = useRouter();
  const { data, isLoading } = useHomepageSections("type=welcome&enabled=true");

  const config = data?.[0]?.config as WelcomeSectionConfig | undefined;
  const h1 = config?.h1 ?? t("heroTitle");
  const subtitle = config?.subtitle ?? t("heroSubtitle");
  const showCTA = config?.showCTA ?? true;
  const ctaText = config?.ctaText ?? t("shopNow");
  const ctaLink = config?.ctaLink ?? ROUTES.PUBLIC.PRODUCTS;
  const trustChips: WelcomeSectionChip[] = TRUST_CHIP_KEYS.map((key) => ({
    key,
    emoji: TRUST_CHIP_EMOJIS[key],
    label: t(key),
  }));

  return (
    <AppkitWelcomeSection
      title={h1}
      subtitle={subtitle}
      pillLabel={t("welcomePill")}
      showCTA={showCTA}
      ctaLabel={ctaText}
      onCtaClick={() => router.push(ctaLink)}
      secondaryCtaLabel={t("welcomeSecondaryCta")}
      onSecondaryCtaClick={() => router.push(ROUTES.PUBLIC.PRODUCTS)}
      trustChips={trustChips}
      isLoading={isLoading}
      brandLogoText="LIR"
    />
  );
}
