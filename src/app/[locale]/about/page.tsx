import type { Metadata } from "next";
import { AboutView } from "@mohasinac/appkit";
import { siteSettingsRepository } from "@mohasinac/appkit";
import { getTranslations } from "next-intl/server";
import { generateMetadata as _gm } from "@/constants/seo.server";

export const revalidate = 3600;

export const metadata: Metadata = _gm({
  title: "About LetItRip — India's Collectibles Marketplace",
  description:
    "Learn about LetItRip — our mission, how the platform works, and the values behind India's largest collectibles marketplace.",
  path: "/about",
  keywords: ["about letitrip", "collectibles marketplace india", "who we are"],
});

export default async function Page() {
  const t = await getTranslations("about");

  let aboutContent: Record<string, string> = {};
  try {
    const settings = await siteSettingsRepository.getSingleton();
    aboutContent = (settings as any).aboutContent ?? {};
  } catch {
    // Firestore unavailable — use i18n defaults
  }

  const val = (key: keyof typeof aboutContent, fallback: string) =>
    aboutContent[key] || fallback;

  return (
    <AboutView
      labels={{
        title: val("title", t("title")),
        subtitle: val("subtitle", t("subtitle")),
        missionTitle: val("missionTitle", t("missionTitle")),
        missionText: val("missionText", t("missionText")),
        howItWorksTitle: t("howItWorksTitle"),
        valuesTitle: t("valuesTitle"),
        milestonesTitle: t("milestonesTitle"),
        ctaTitle: val("ctaTitle", t("ctaTitle")),
        ctaSell: t("ctaSell"),
        ctaShop: t("ctaShop"),
      }}
      howItems={[
        {
          title: t("howBuyersTitle"),
          text: t("howBuyersText"),
          icon: "🛒",
          color: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
        },
        {
          title: t("howSellersTitle"),
          text: t("howSellersText"),
          icon: "🏪",
          color: "from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20",
        },
        {
          title: t("howBiddersTitle"),
          text: t("howBiddersText"),
          icon: "⚡",
          color: "from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20",
        },
      ]}
      valueItems={[
        { title: t("valuesTrust"), text: t("valuesTrustText"), icon: "🛡️" },
        { title: t("valuesCommunity"), text: t("valuesCommunityText"), icon: "🤝" },
        { title: t("valuesInnovation"), text: t("valuesInnovationText"), icon: "🚀" },
      ]}
      milestones={[
        { year: "2024", text: t("milestoneFounded") },
        { year: "2025", text: t("milestoneAuctions") },
        { year: "2026", text: t("milestoneMobile") },
      ]}
    />
  );
}
