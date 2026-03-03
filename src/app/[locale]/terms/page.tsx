import type { Metadata } from "next";
import { ROUTES, THEME_CONSTANTS, SITE_CONFIG } from "@/constants";
import { getTranslations } from "next-intl/server";
import { Heading, Text, TextLink, Section } from "@/components";

const { themed, typography, page } = THEME_CONSTANTS;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("terms");
  return {
    title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
  };
}

export default async function TermsPage() {
  const t = await getTranslations("terms");

  const SECTIONS = [
    { title: t("acceptanceTitle"), text: t("acceptanceText") },
    { title: t("useTitle"), text: t("useText") },
    { title: t("accountsTitle"), text: t("accountsText") },
    { title: t("sellersTitle"), text: t("sellersText") },
    { title: t("auctionsTitle"), text: t("auctionsText") },
    { title: t("liabilityTitle"), text: t("liabilityText") },
    { title: t("changesTitle"), text: t("changesText") },
  ];

  return (
    <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-6 sm:-mt-8 lg:-mt-10">
      {/* Header */}
      <Section className="bg-gradient-to-br from-slate-700 to-slate-900 text-white py-14 md:py-16 lg:py-20">
        <div className={`${page.container.sm}`}>
          <Heading level={1} className="mb-3">
            {t("title")}
          </Heading>
          <Text className="text-slate-300">{t("lastUpdated")}</Text>
        </div>
      </Section>

      <div className={`${page.container.sm} py-10 md:py-12 lg:py-16`}>
        <Text size="lg" variant="secondary" className="mb-10">
          {t("subtitle")}
        </Text>

        <div className="space-y-8">
          {SECTIONS.map(({ title, text }) => (
            <Section key={title}>
              <Heading level={2} className={`${typography.h3} mb-3`}>
                {title}
              </Heading>
              <Text variant="secondary" className="leading-relaxed">
                {text}
              </Text>
            </Section>
          ))}

          {/* Contact */}
          <Section
            className={`${themed.bgSecondary} rounded-xl p-6 border ${themed.border}`}
          >
            <Heading level={2} className={`${typography.h4} mb-2`}>
              {t("contactTitle")}
            </Heading>
            <Text variant="secondary">{t("contactText")}</Text>
          </Section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex gap-6 text-sm">
          <TextLink href={ROUTES.PUBLIC.PRIVACY}>{t("privacyPolicy")}</TextLink>
          <TextLink href={ROUTES.PUBLIC.CONTACT}>{t("contactUs")}</TextLink>
        </div>
      </div>
    </div>
  );
}
