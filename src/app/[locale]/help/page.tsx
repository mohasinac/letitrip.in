import type { Metadata } from "next";
import { ROUTES, THEME_CONSTANTS, SITE_CONFIG } from "@/constants";
import { getTranslations } from "next-intl/server";
import { Heading, Text, TextLink, Section } from "@/components";

const { themed, typography, page } = THEME_CONSTANTS;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("help");
  return {
    title: `${t("metaTitle")} – ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
  };
}

export default async function HelpPage() {
  const t = await getTranslations("help");

  const TOPICS = [
    { key: "orders", icon: "box", label: t("topicOrders"), q: "orders" },
    { key: "payments", icon: "card", label: t("topicPayments"), q: "payment" },
    { key: "account", icon: "user", label: t("topicAccount"), q: "account" },
    { key: "selling", icon: "shop", label: t("topicSelling"), q: "sellers" },
    {
      key: "auctions",
      icon: "trophy",
      label: t("topicAuctions"),
      q: "products",
    },
  ];

  return (
    <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-6 sm:-mt-8 lg:-mt-10">
      <Section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-14 md:py-16 lg:py-20">
        <div className={`${page.container.sm} text-center`}>
          <Heading level={1} className="mb-4">
            {t("title")}
          </Heading>
          <Text className="text-blue-100 text-lg mb-8">{t("subtitle")}</Text>
          <TextLink
            href={ROUTES.PUBLIC.FAQS}
            variant="inherit"
            className="inline-flex items-center gap-2 bg-white text-indigo-700 font-medium px-6 py-3 rounded-full hover:bg-indigo-50 transition-colors"
          >
            {t("searchPlaceholder")}
          </TextLink>
        </div>
      </Section>

      <div
        className={`${page.container.lg} py-14 md:py-16 space-y-14 md:space-y-16`}
      >
        <Section>
          <Heading
            level={2}
            className={`${typography.h2} ${themed.textPrimary} text-center mb-10`}
          >
            {t("browseTitle")}
          </Heading>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-3 md:gap-4">
            {TOPICS.map(({ key, label, q }) => (
              <TextLink
                key={key}
                href={`${ROUTES.PUBLIC.FAQS}?category=${q}`}
                variant="inherit"
                className={`${themed.bgSecondary} border ${themed.border} rounded-xl p-5 text-center hover:border-indigo-400 hover:shadow-md transition-all group`}
              >
                <Text
                  size="sm"
                  weight="medium"
                  className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                >
                  {label}
                </Text>
              </TextLink>
            ))}
          </div>
        </Section>

        <Section
          className={`${themed.bgSecondary} rounded-2xl p-8 border ${themed.border} text-center`}
        >
          <Heading level={2} className={`${typography.h3} mb-4`}>
            {t("popularTitle")}
          </Heading>
          <Text variant="secondary" className="mb-6">
            {t("faqDescription")}
          </Text>
          <TextLink
            href={ROUTES.PUBLIC.FAQS}
            variant="inherit"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-8 py-3 rounded-full hover:bg-indigo-700 transition-colors"
          >
            {t("faqsLink")}
          </TextLink>
        </Section>

        <Section className="text-center">
          <Heading level={2} className={`${typography.h3} mb-4`}>
            {t("contactPrompt")}
          </Heading>
          <Text variant="secondary" className="mb-6">
            {t("supportResponseTime")}
          </Text>
          <TextLink
            href={ROUTES.PUBLIC.CONTACT}
            variant="inherit"
            className="inline-flex items-center gap-2 border-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-semibold px-8 py-3 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
          >
            {t("contactLink")}
          </TextLink>
        </Section>
      </div>
    </div>
  );
}
