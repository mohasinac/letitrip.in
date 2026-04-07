import type { Metadata } from "next";
import { ROUTES, THEME_CONSTANTS, SITE_CONFIG } from "@/constants";
import { Heading, Text, Section, TextLink, FlowDiagram } from "@/components";
import type { FlowStep } from "@/components";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { resolveLocale } from "@/i18n/resolve-locale";

export const revalidate = 3600;

const { themed, page } = THEME_CONSTANTS;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = await getTranslations({ locale, namespace: "refundPolicy" });
  return {
    title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
  };
}

export default async function RefundPolicyPage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "refundPolicy" });

  const SECTIONS = [
    { title: t("eligibilityTitle"), text: t("eligibilityText") },
    { title: t("processTitle"), text: t("processText") },
    { title: t("timelineTitle"), text: t("timelineText") },
    { title: t("auctionsTitle"), text: t("auctionsText") },
    { title: t("exchangesTitle"), text: t("exchangesText") },
    { title: t("shippingTitle"), text: t("shippingText") },
    { title: t("nonRefundableTitle"), text: t("nonRefundableText") },
  ];

  const DIAGRAM_STEPS: FlowStep[] = [
    {
      emoji: "📋",
      circleClass:
        "bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600",
      badge: t("diagramS1"),
      badgeClass:
        "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
      desc: t("diagramS1Desc"),
    },
    {
      emoji: "✋",
      circleClass:
        "bg-amber-100 dark:bg-amber-900/40 border-2 border-amber-300 dark:border-amber-600",
      badge: t("diagramS2"),
      badgeClass:
        "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
      desc: t("diagramS2Desc"),
    },
    {
      emoji: "🔍",
      circleClass:
        "bg-sky-100 dark:bg-sky-900/40 border-2 border-sky-300 dark:border-sky-600",
      badge: t("diagramS3"),
      badgeClass:
        "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300",
      desc: t("diagramS3Desc"),
    },
    {
      emoji: "✅",
      circleClass:
        "bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-400 dark:border-emerald-600",
      badge: t("diagramS4"),
      badgeClass:
        "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
      desc: t("diagramS4Desc"),
    },
    {
      emoji: "💚",
      circleClass:
        "bg-violet-100 dark:bg-violet-900/40 border-2 border-violet-400 dark:border-violet-600",
      badge: t("diagramS5"),
      badgeClass:
        "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300",
      desc: t("diagramS5Desc"),
    },
  ];

  return (
    <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-6 sm:-mt-8 lg:-mt-10">
      {/* Header */}
      <Section
        className={`${THEME_CONSTANTS.accentBanner.pageHero} text-white py-14 md:py-16 lg:py-20`}
      >
        <div className={`${page.container.sm}`}>
          <Heading level={1} variant="none" className="mb-3 text-white">
            {t("title")}
          </Heading>
          <Text variant="none" className="text-white/80">
            {t("lastUpdated")}
          </Text>
        </div>
      </Section>

      <div className={`${page.container.sm} py-10 md:py-12 lg:py-16`}>
        <Text size="lg" variant="secondary" className="mb-8">
          {t("subtitle")}
        </Text>

        {/* ── Refund Request Flow Diagram ── */}
        <FlowDiagram
          title={`💸 ${t("diagramTitle")}`}
          titleClass="text-emerald-700 dark:text-emerald-300"
          connectorClass="bg-emerald-200 dark:bg-emerald-800"
          steps={DIAGRAM_STEPS}
          className="mb-10"
        />

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

        <div
          className={`mt-12 pt-8 border-t ${themed.border} flex gap-6 text-sm`}
        >
          <TextLink
            href={ROUTES.PUBLIC.HELP}
            className="text-primary hover:underline"
          >
            {t("helpCenter")}
          </TextLink>
          <TextLink
            href={ROUTES.PUBLIC.CONTACT}
            className="text-primary hover:underline"
          >
            {t("contactUs")}
          </TextLink>
          <TextLink
            href={ROUTES.PUBLIC.SHIPPING_POLICY}
            className="text-primary hover:underline"
          >
            Shipping Policy
          </TextLink>
        </div>
      </div>
    </div>
  );
}
