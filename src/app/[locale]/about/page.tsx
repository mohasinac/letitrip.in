import { normalizeError } from "@mohasinac/appkit";
import type { Metadata } from "next";
import { AboutView } from "@mohasinac/appkit";
import type { AboutContentDocument } from "@mohasinac/appkit";
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

  let aboutContent: AboutContentDocument | undefined;
  try {
    const settings = await siteSettingsRepository.getSingleton();
    aboutContent = settings.aboutContent;
  } catch (_err) {
    void normalizeError(_err);
    // Firestore unavailable — use i18n defaults
  }

  const val = (key: keyof AboutContentDocument, fallback: string) => {
    const value = aboutContent?.[key];
    return typeof value === "string" && value ? value : fallback;
  };

  return (
    <AboutView
      labels={{
        title: val("title", t("title")),
        subtitle: val("subtitle", t("subtitle")),
        missionTitle: val("missionTitle", t("missionTitle")),
        missionText: val("missionText", t("missionText")),
        howItWorksTitle: val("howItWorksTitle", t("howItWorksTitle")),
        valuesTitle: val("valuesTitle", t("valuesTitle")),
        milestonesTitle: val("milestonesTitle", t("milestonesTitle")),
        teamTitle: aboutContent?.teamTitle ?? "Meet the Team",
        teamSubtitle: aboutContent?.teamSubtitle,
        ctaTitle: val("ctaTitle", t("ctaTitle")),
        ctaSell: val("ctaSell", t("ctaSell")),
        ctaShop: val("ctaShop", t("ctaShop")),
      }}
      howItems={
        aboutContent?.howItems?.length
          ? aboutContent.howItems
          : [
              {
                title: t("howBuyersTitle"),
                text: t("howBuyersText"),
                icon: "🛒",
                tone: "indigo",
              },
              {
                title: t("howSellersTitle"),
                text: t("howSellersText"),
                icon: "🏪",
                tone: "teal",
              },
              {
                title: t("howBiddersTitle"),
                text: t("howBiddersText"),
                icon: "⚡",
                tone: "amber",
              },
            ]
      }
      valueItems={
        aboutContent?.valueItems?.length
          ? aboutContent.valueItems
          : [
              { title: t("valuesTrust"), text: t("valuesTrustText"), icon: "🛡️" },
              { title: t("valuesCommunity"), text: t("valuesCommunityText"), icon: "🤝" },
              { title: t("valuesInnovation"), text: t("valuesInnovationText"), icon: "🚀" },
            ]
      }
      milestones={
        aboutContent?.milestones?.length
          ? aboutContent.milestones
          : [
              { year: "2024", text: t("milestoneFounded") },
              { year: "2025", text: t("milestoneAuctions") },
              { year: "2026", text: t("milestoneMobile") },
            ]
      }
      teamMembers={aboutContent?.teamMembers ?? []}
    />
  );
}
