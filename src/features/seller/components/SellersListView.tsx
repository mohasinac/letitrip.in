import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { getTranslations } from "next-intl/server";
import { Heading, Section, Text } from "@mohasinac/appkit/ui";
import { TextLink } from "@/components";

const { themed, spacing, button, flex } = THEME_CONSTANTS;

export async function SellersListView() {
  const t = await getTranslations("sellersPage");

  const BENEFITS = [
    { title: t("benefitReach"), text: t("benefitReachText"), icon: "🌍" },
    { title: t("benefitTools"), text: t("benefitToolsText"), icon: "🛠️" },
    { title: t("benefitTrust"), text: t("benefitTrustText"), icon: "🛡️" },
    { title: t("benefitFees"), text: t("benefitFeesText"), icon: "💰" },
  ];

  const STEPS = [
    { step: "01", title: t("step1Title"), text: t("step1Text") },
    { step: "02", title: t("step2Title"), text: t("step2Text") },
    { step: "03", title: t("step3Title"), text: t("step3Text") },
  ];

  const FAQS = [
    { q: t("faq1Q"), a: t("faq1A") },
    { q: t("faq2Q"), a: t("faq2A") },
    { q: t("faq3Q"), a: t("faq3A") },
  ];

  return (
    <div className={`${themed.bgPrimary} min-h-screen`}>
      {/* Hero */}
      <Section
        className={`${THEME_CONSTANTS.accentBanner.pageHero} text-white py-24 px-4`}
      >
        <div className="max-w-4xl mx-auto text-center">
          <Heading level={1} className="text-4xl md:text-6xl font-bold mb-6">
            {t("title")}
          </Heading>
          <Text className="text-xl text-white mb-10 max-w-2xl mx-auto">
            {t("subtitle")}
          </Text>
          <div className="flex justify-center gap-4 flex-wrap">
            <TextLink href={ROUTES.AUTH.REGISTER} className={button.ctaPrimary}>
              {t("heroCta")}
            </TextLink>
            <TextLink href="#how-it-works" className={button.ctaOutline}>
              {t("heroSecondary")}
            </TextLink>
          </div>
        </div>
      </Section>

      {/* Stats bar */}
      <Section
        className={`${THEME_CONSTANTS.accentBanner.statBarBg} text-white py-6 px-4`}
      >
        <div className="max-w-4xl mx-auto flex justify-center gap-12 flex-wrap">
          {[
            { label: t("statSellersLabel"), value: t("statSellersValue") },
            { label: t("statProductsLabel"), value: t("statProductsValue") },
            { label: t("statBuyersLabel"), value: t("statBuyersValue") },
            {
              label: t("statCommissionLabel"),
              value: t("statCommissionValue"),
            },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <Text className="text-2xl font-bold">{value}</Text>
              <Text className="text-white/80 text-sm">{label}</Text>
            </div>
          ))}
        </div>
      </Section>

      <div className="max-w-5xl mx-auto px-4 py-20 space-y-24">
        {/* Benefits */}
        <Section>
          <Heading level={2} className="text-center mb-12">
            {t("whyTitle")}
          </Heading>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {BENEFITS.map(({ title, text, icon }) => (
              <div
                key={title}
                className={`${themed.bgSecondary} border ${themed.border} rounded-2xl p-6 flex gap-5`}
              >
                <div className="text-4xl shrink-0">{icon}</div>
                <div>
                  <Heading level={3} className="mb-2">
                    {title}
                  </Heading>
                  <Text
                    size="sm"
                    variant="secondary"
                    className="leading-relaxed"
                  >
                    {text}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* How it works */}
        <Section id="how-it-works">
          <Heading level={2} className="text-center mb-12">
            {t("howTitle")}
          </Heading>
          <div className="grid md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-8">
            {STEPS.map(({ step, title, text }) => (
              <div key={step} className="text-center">
                <div
                  className={`w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-2xl font-bold ${flex.center} mx-auto mb-4`}
                >
                  {step}
                </div>
                <Heading level={3} className="mb-2">
                  {title}
                </Heading>
                <Text size="sm" variant="secondary">
                  {text}
                </Text>
              </div>
            ))}
          </div>
        </Section>

        {/* FAQs */}
        <Section>
          <Heading level={2} className="text-center mb-10">
            {t("faqTitle")}
          </Heading>
          <div className={`${spacing.stack} max-w-2xl mx-auto`}>
            {FAQS.map(({ q, a }) => (
              <div
                key={q}
                className={`${themed.bgSecondary} border ${themed.border} rounded-xl p-6`}
              >
                <Heading level={3} className="font-semibold mb-2">
                  {q}
                </Heading>
                <Text size="sm" variant="secondary">
                  {a}
                </Text>
              </div>
            ))}
          </div>
        </Section>

        {/* Final CTA */}
        <Section
          className={`text-center ${THEME_CONSTANTS.accentBanner.cta} rounded-2xl p-12 text-white`}
        >
          <Heading level={2} className="text-3xl font-bold mb-4">
            {t("ctaTitle")}
          </Heading>
          <TextLink
            href={ROUTES.AUTH.REGISTER}
            className={`inline-block mt-4 ${button.ctaPrimary}`}
          >
            {t("ctaButton")}
          </TextLink>
          <Text className="mt-4 text-white/90 text-sm">
            {t("signInPrompt")}{" "}
            <TextLink
              href={ROUTES.AUTH.LOGIN}
              className="underline font-medium"
            >
              {t("signInLink")}
            </TextLink>
          </Text>
        </Section>
      </div>
    </div>
  );
}

