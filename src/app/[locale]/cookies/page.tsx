import type { Metadata } from "next";
import { ROUTES, THEME_CONSTANTS, SITE_CONFIG } from "@/constants";
import { Heading, Text, Section, Stack, Container } from "@mohasinac/appkit/ui";
import { TextLink } from "@/components";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { resolveLocale } from "@/i18n/resolve-locale";

export const revalidate = 3600;

const { themed } = THEME_CONSTANTS;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = await getTranslations({ locale, namespace: "cookies" });
  return {
    title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
  };
}

export default async function CookiePolicyPage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "cookies" });

  const SECTIONS = [
    { title: t("whatTitle"), text: t("whatText") },
    { title: t("typesTitle"), text: t("typesText") },
    { title: t("essentialTitle"), text: t("essentialText") },
    { title: t("analyticsTitle"), text: t("analyticsText") },
    { title: t("marketingTitle"), text: t("marketingText") },
    { title: t("controlTitle"), text: t("controlText") },
    { title: t("thirdPartyTitle"), text: t("thirdPartyText") },
    { title: t("changesTitle"), text: t("changesText") },
  ];

  return (
    <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-6 sm:-mt-8 lg:-mt-10">
      {/* Header */}
      <Section
        className={`${THEME_CONSTANTS.accentBanner.pageHero} text-white py-14 md:py-16 lg:py-20`}
      >
          <Container size="sm">
          <Heading level={1} variant="none" className="mb-3 text-white">
            {t("title")}
          </Heading>
          <Text variant="none" className="text-white/80">
            {t("lastUpdated")}
          </Text>
          </Container>
      </Section>

      <Container size="sm" className="py-10 md:py-12 lg:py-16">
        <Text size="lg" variant="secondary" className="mb-10">
          {t("subtitle")}
        </Text>

        <Stack gap="xl">
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
        </Stack>

        <div
          className={`mt-12 pt-8 border-t ${themed.border} flex gap-6 text-sm`}
        >
          <TextLink
            href={ROUTES.PUBLIC.PRIVACY}
            className="text-primary hover:underline"
          >
            {t("privacyPolicy")}
          </TextLink>
          <TextLink
            href={ROUTES.PUBLIC.CONTACT}
            className="text-primary hover:underline"
          >
            {t("contactUs")}
          </TextLink>
        </div>
      </Container>
    </div>
  );
}
