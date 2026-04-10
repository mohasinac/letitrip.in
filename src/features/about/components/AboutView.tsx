import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { getTranslations } from "next-intl/server";
import { AboutView as AppkitAboutView } from "@mohasinac/appkit/features/about";
import { TextLink } from "@/components";

export async function AboutView() {
  const t = await getTranslations("about");

  return (
    <AppkitAboutView
      heroBannerClass={THEME_CONSTANTS.accentBanner.pageHero}
      ctaBannerClass={THEME_CONSTANTS.accentBanner.cta}
      labels={{
        title: t("title"),
        subtitle: t("subtitle"),
        missionTitle: t("missionTitle"),
        missionText: t("missionText"),
        howItWorksTitle: t("howItWorksTitle"),
        valuesTitle: t("valuesTitle"),
        milestonesTitle: t("milestonesTitle"),
        ctaTitle: t("ctaTitle"),
        ctaSell: t("ctaSell"),
        ctaShop: t("ctaShop"),
      }}
      howItems={[
        {
          title: t("howBuyersTitle"),
          text: t("howBuyersText"),
          icon: "\uD83D\uDED2",
          color:
            "from-primary/5 to-primary/5 dark:from-primary/10 dark:to-primary/10",
        },
        {
          title: t("howSellersTitle"),
          text: t("howSellersText"),
          icon: "\uD83E\uDE99",
          color:
            "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
        },
        {
          title: t("howBiddersTitle"),
          text: t("howBiddersText"),
          icon: "\uD83C\uDFC6",
          color:
            "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
        },
      ]}
      valueItems={[
        {
          title: t("valuesTrust"),
          text: t("valuesTrustText"),
          icon: "\uD83D\uDD12",
        },
        {
          title: t("valuesCommunity"),
          text: t("valuesCommunityText"),
          icon: "\uD83E\uDD1D",
        },
        {
          title: t("valuesInnovation"),
          text: t("valuesInnovationText"),
          icon: "\uD83D\uDE80",
        },
      ]}
      milestones={[
        { year: "2023", text: t("milestoneFounded") },
        { year: "2024", text: t("milestoneAuctions") },
        { year: "2025", text: t("milestoneMobile") },
      ]}
      renderCtaButtons={() => (
        <div className="flex justify-center gap-3 md:gap-4 flex-wrap">
          <TextLink
            href={ROUTES.AUTH.REGISTER}
            className="bg-white text-primary-700 dark:text-secondary-700 font-semibold px-8 py-3 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-100 transition-colors"
          >
            {t("ctaSell")}
          </TextLink>
          <TextLink
            href={ROUTES.PUBLIC.PRODUCTS}
            className="border-2 border-white text-white font-semibold px-8 py-3 rounded-full hover:bg-white/10 transition-colors"
          >
            {t("ctaShop")}
          </TextLink>
        </div>
      )}
    />
  );
}
