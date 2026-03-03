import type { Metadata } from "next";
import { ROUTES, THEME_CONSTANTS, SITE_CONFIG } from "@/constants";
import { Heading, Text, Section, TextLink } from "@/components";
import { getTranslations } from "next-intl/server";

const { themed, page } = THEME_CONSTANTS;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("refundPolicy");
  return {
    title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
  };
}

export default async function RefundPolicyPage() {
  const t = await getTranslations("refundPolicy");

  const SECTIONS = [
    { title: t("eligibilityTitle"), text: t("eligibilityText") },
    { title: t("processTitle"), text: t("processText") },
    { title: t("timelineTitle"), text: t("timelineText") },
    { title: t("auctionsTitle"), text: t("auctionsText") },
    { title: t("exchangesTitle"), text: t("exchangesText") },
    { title: t("shippingTitle"), text: t("shippingText") },
    { title: t("nonRefundableTitle"), text: t("nonRefundableText") },
  ];

  return (
    <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-6 sm:-mt-8 lg:-mt-10">
      {/* Header */}
      <Section className="bg-gradient-to-br from-emerald-700 to-teal-900 text-white py-14 md:py-16 lg:py-20">
        <div className={`${page.container.sm}`}>
          <Heading level={1} className="mb-3 text-white">
            {t("title")}
          </Heading>
          <Text className="text-emerald-200">{t("lastUpdated")}</Text>
        </div>
      </Section>

      <div className={`${page.container.sm} py-10 md:py-12 lg:py-16`}>
        <Text size="lg" variant="secondary" className="mb-10">
          {t("subtitle")}
        </Text>

        <div className="space-y-8">
          {SECTIONS.map(({ title, text }) => (
            <Section key={title}>
              <Heading level={2} className="mb-3">
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
            <Heading level={2} className="mb-2">
              {t("contactTitle")}
            </Heading>
            <Text variant="secondary">{t("contactText")}</Text>
          </Section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex gap-6 text-sm">
          <TextLink
            href={ROUTES.PUBLIC.HELP}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {t("helpCenter")}
          </TextLink>
          <TextLink
            href={ROUTES.PUBLIC.CONTACT}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {t("contactUs")}
          </TextLink>
        </div>
      </div>
    </div>
  );
}
