import type { Metadata } from "next";
import { ROUTES, THEME_CONSTANTS, SITE_CONFIG } from "@/constants";
import { Heading, Text, Section, TextLink, FlowDiagram } from "@/components";
import type { FlowStep } from "@/components";
import { getTranslations } from "next-intl/server";

export const revalidate = 3600;

const { themed, page } = THEME_CONSTANTS;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("shippingPolicy");
  return {
    title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
  };
}

export default async function ShippingPolicyPage() {
  const t = await getTranslations("shippingPolicy");

  const SECTIONS = [
    { title: t("orderProcessTitle"), text: t("orderProcessText") },
    { title: t("standardTitle"), text: t("standardText") },
    { title: t("expressTitle"), text: t("expressText") },
    { title: t("freeShippingTitle"), text: t("freeShippingText") },
    { title: t("auctionShippingTitle"), text: t("auctionShippingText") },
    { title: t("trackingTitle"), text: t("trackingText") },
    { title: t("internationalTitle"), text: t("internationalText") },
    { title: t("damagedTitle"), text: t("damagedText") },
  ];

  const DIAGRAM_STEPS: FlowStep[] = [
    {
      emoji: "✅",
      circleClass:
        "bg-indigo-100 dark:bg-indigo-900/40 border-2 border-indigo-300 dark:border-indigo-600",
      badge: t("diagramStatus1"),
      badgeClass:
        "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300",
      desc: t("diagramStatus1Desc"),
    },
    {
      emoji: "📦",
      circleClass:
        "bg-amber-100 dark:bg-amber-900/40 border-2 border-amber-300 dark:border-amber-600",
      badge: t("diagramStatus2"),
      badgeClass:
        "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
      desc: t("diagramStatus2Desc"),
    },
    {
      emoji: "🚀",
      circleClass:
        "bg-sky-100 dark:bg-sky-900/40 border-2 border-sky-300 dark:border-sky-600",
      badge: t("diagramStatus3"),
      badgeClass:
        "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300",
      desc: t("diagramStatus3Desc"),
    },
    {
      emoji: "🚚",
      circleClass:
        "bg-violet-100 dark:bg-violet-900/40 border-2 border-violet-300 dark:border-violet-600",
      badge: t("diagramStatus4"),
      badgeClass:
        "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300",
      desc: t("diagramStatus4Desc"),
    },
    {
      emoji: "🏠",
      circleClass:
        "bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-400 dark:border-emerald-600",
      badge: t("diagramStatus5"),
      badgeClass:
        "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
      desc: t("diagramStatus5Desc"),
    },
  ];

  return (
    <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-6 sm:-mt-8 lg:-mt-10">
      {/* Header */}
      <Section className="bg-gradient-to-br from-sky-600 to-blue-900 text-white py-14 md:py-16 lg:py-20">
        <div className={`${page.container.sm}`}>
          <Heading level={1} variant="none" className="mb-3 text-white">
            {t("title")}
          </Heading>
          <Text className="text-sky-200">{t("lastUpdated")}</Text>
        </div>
      </Section>

      <div className={`${page.container.sm} py-10 md:py-12 lg:py-16`}>
        <Text size="lg" variant="secondary" className="mb-8">
          {t("subtitle")}
        </Text>

        {/* ── Order Delivery Diagram ── */}
        <FlowDiagram
          title={`🚚 ${t("diagramTitle")}`}
          titleClass="text-sky-700 dark:text-sky-300"
          connectorClass="bg-sky-200 dark:bg-sky-800"
          steps={DIAGRAM_STEPS}
          className="mb-10"
          note={`📌 ${t("diagramNote")}`}
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
            href={ROUTES.PUBLIC.TRACK_ORDER}
            className="text-sky-600 dark:text-sky-400 hover:underline"
          >
            {t("trackOrder")}
          </TextLink>
          <TextLink
            href={ROUTES.PUBLIC.HELP}
            className="text-sky-600 dark:text-sky-400 hover:underline"
          >
            {t("helpCenter")}
          </TextLink>
          <TextLink
            href={ROUTES.PUBLIC.CONTACT}
            className="text-sky-600 dark:text-sky-400 hover:underline"
          >
            {t("contactUs")}
          </TextLink>
          <TextLink
            href={ROUTES.PUBLIC.REFUND_POLICY}
            className="text-sky-600 dark:text-sky-400 hover:underline"
          >
            Refund Policy
          </TextLink>
        </div>
      </div>
    </div>
  );
}
