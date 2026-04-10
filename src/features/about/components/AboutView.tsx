import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { getTranslations } from "next-intl/server";
import { Heading, Text, Span, Section } from "@mohasinac/appkit/ui";
import { TextLink } from "@/components";

const { themed, spacing, page } = THEME_CONSTANTS;

export async function AboutView() {
  const t = await getTranslations("about");

  return (
    <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-6 sm:-mt-8 lg:-mt-10">
      {/* Hero — full-bleed within the content container */}
      <Section
        className={`${THEME_CONSTANTS.accentBanner.pageHero} text-white py-16 md:py-20 lg:py-24`}
      >
        <div className={`${page.container.md} text-center`}>
          <Heading
            level={1}
            variant="none"
            className="text-4xl md:text-5xl font-bold mb-6 text-white"
          >
            {t("title")}
          </Heading>
          <Text
            variant="none"
            className="text-xl text-white/80 max-w-2xl mx-auto"
          >
            {t("subtitle")}
          </Text>
        </div>
      </Section>

      <div
        className={`${page.container.lg} py-16 md:py-20 space-y-16 md:space-y-20`}
      >
        {/* Mission */}
        <Section className="text-center max-w-3xl mx-auto">
          <Heading level={2} className="mb-4">
            {t("missionTitle")}
          </Heading>
          <Text size="lg" variant="secondary" className="leading-relaxed">
            {t("missionText")}
          </Text>
        </Section>

        {/* How it works */}
        <Section>
          <Heading level={2} className="text-center mb-12">
            {t("howItWorksTitle")}
          </Heading>
          <div className="grid md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-6 md:gap-8 xl:gap-10">
            {[
              {
                title: t("howBuyersTitle"),
                text: t("howBuyersText"),
                icon: "🛒",
                color:
                  "from-primary/5 to-primary/5 dark:from-primary/10 dark:to-primary/10",
              },
              {
                title: t("howSellersTitle"),
                text: t("howSellersText"),
                icon: "🪙",
                color:
                  "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
              },
              {
                title: t("howBiddersTitle"),
                text: t("howBiddersText"),
                icon: "🏆",
                color:
                  "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
              },
            ].map(({ title, text, icon, color }) => (
              <div
                key={title}
                className={`bg-gradient-to-br ${color} rounded-2xl p-6 ${spacing.stack}`}
              >
                <div className="text-4xl">{icon}</div>
                <Heading level={3}>{title}</Heading>
                <Text size="sm" variant="secondary" className="leading-relaxed">
                  {text}
                </Text>
              </div>
            ))}
          </div>
        </Section>

        {/* Values */}
        <Section>
          <Heading level={2} className="text-center mb-12">
            {t("valuesTitle")}
          </Heading>
          <div className="grid md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-5 md:gap-6 xl:gap-8">
            {[
              {
                title: t("valuesTrust"),
                text: t("valuesTrustText"),
                icon: "🔒",
              },
              {
                title: t("valuesCommunity"),
                text: t("valuesCommunityText"),
                icon: "🤝",
              },
              {
                title: t("valuesInnovation"),
                text: t("valuesInnovationText"),
                icon: "🚀",
              },
            ].map(({ title, text, icon }) => (
              <div
                key={title}
                className={`${themed.bgSecondary} rounded-xl p-6 ${spacing.stack} border ${themed.border}`}
              >
                <div className="text-3xl">{icon}</div>
                <Heading level={3}>{title}</Heading>
                <Text size="sm" variant="secondary" className="leading-relaxed">
                  {text}
                </Text>
              </div>
            ))}
          </div>
        </Section>

        {/* Milestones */}
        <Section>
          <Heading level={2} className="text-center mb-10">
            {t("milestonesTitle")}
          </Heading>
          <div className="relative border-l-2 border-primary/30 pl-8 space-y-8 max-w-2xl mx-auto">
            {[
              { year: "2023", text: t("milestoneFounded") },
              { year: "2024", text: t("milestoneAuctions") },
              { year: "2025", text: t("milestoneMobile") },
            ].map(({ year, text }) => (
              <div key={year} className="relative">
                <div className="absolute -left-10 top-1 w-4 h-4 rounded-full bg-primary border-2 border-white dark:border-slate-900" />
                <Span
                  size="xs"
                  weight="bold"
                  className="text-primary uppercase tracking-wide"
                >
                  {year}
                </Span>
                <Text className="mt-1">{text}</Text>
              </div>
            ))}
          </div>
        </Section>

        {/* CTA */}
        <Section
          className={`text-center ${THEME_CONSTANTS.accentBanner.cta} rounded-2xl p-8 md:p-12 xl:p-16 text-white`}
        >
          <Heading
            level={2}
            variant="none"
            className="text-3xl font-bold mb-8 text-white"
          >
            {t("ctaTitle")}
          </Heading>
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
        </Section>
      </div>
    </div>
  );
}
