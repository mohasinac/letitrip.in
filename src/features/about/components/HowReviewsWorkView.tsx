import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { Heading, Text, Section, TextLink, FlowDiagram } from "@/components";
import type { FlowStep } from "@/components";
import { getTranslations } from "next-intl/server";
import { ShieldCheck, ThumbsUp, Pencil } from "lucide-react";

const { themed, flex, page } = THEME_CONSTANTS;

export async function HowReviewsWorkView() {
  const t = await getTranslations("howReviewsWork");

  const STEPS = [
    {
      number: 1,
      icon: "🛍️",
      title: t("step1Title"),
      text: t("step1Text"),
    },
    {
      number: 2,
      icon: "✍️",
      title: t("step2Title"),
      text: t("step2Text"),
    },
    {
      number: 3,
      icon: "⏳",
      title: t("step3Title"),
      text: t("step3Text"),
    },
    {
      number: 4,
      icon: "🌐",
      title: t("step4Title"),
      text: t("step4Text"),
    },
  ];

  const INFO_CARDS = [
    {
      icon: ShieldCheck,
      title: t("verifiedTitle"),
      text: t("verifiedText"),
      color:
        "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-700",
      iconColor: "text-indigo-600 dark:text-indigo-400",
    },
    {
      icon: ThumbsUp,
      title: t("votesTitle"),
      text: t("votesText"),
      color: "bg-sky-50 border-sky-200 dark:bg-sky-900/20 dark:border-sky-700",
      iconColor: "text-sky-600 dark:text-sky-400",
    },
    {
      icon: Pencil,
      title: t("editTitle"),
      text: t("editText"),
      color:
        "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
  ];

  const DIAGRAM_STEPS: FlowStep[] = [
    {
      emoji: "🛍️",
      circleClass:
        "bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-500",
      badge: t("diagramS1"),
      badgeClass:
        "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300",
      desc: t("diagramS1Desc"),
    },
    {
      emoji: "✍️",
      circleClass:
        "bg-indigo-100 dark:bg-indigo-900/40 border-2 border-indigo-400 dark:border-indigo-600",
      badge: t("diagramS2"),
      badgeClass:
        "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300",
      desc: t("diagramS2Desc"),
    },
    {
      emoji: "⏳",
      circleClass:
        "bg-amber-100 dark:bg-amber-900/40 border-2 border-amber-400 dark:border-amber-600",
      badge: t("diagramS3"),
      badgeClass:
        "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
      desc: t("diagramS3Desc"),
    },
    {
      emoji: "🌐",
      circleClass:
        "bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-400 dark:border-emerald-600",
      badge: t("diagramS4"),
      badgeClass:
        "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
      desc: t("diagramS4Desc"),
    },
  ];

  return (
    <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-6 sm:-mt-8 lg:-mt-10">
      {/* Hero */}
      <Section
        className={`${THEME_CONSTANTS.accentBanner.pageHero} text-white py-14 md:py-16 lg:py-20`}
      >
        <div className={`${page.container.md} text-center`}>
          <Heading level={1} variant="none" className="mb-4 text-white">
            {t("title")}
          </Heading>
          <Text variant="none" className="text-white/80 max-w-2xl mx-auto">
            {t("subtitle")}
          </Text>
        </div>
      </Section>

      <div
        className={`${page.container.md} py-10 md:py-12 lg:py-16 space-y-14`}
      >
        {/* Steps */}
        <Section>
          <Heading level={2} className="mb-8 text-center">
            {t("stepsTitle")}
          </Heading>
          <div className="space-y-5">
            {STEPS.map(({ number, icon, title, text }) => (
              <div
                key={number}
                className={`flex items-start gap-4 p-5 rounded-xl border ${themed.border} ${themed.bgPrimary}`}
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 ${flex.center} text-xl`}
                >
                  {icon}
                </div>
                <div>
                  <Text className="font-semibold mb-0.5">
                    {number}. {title}
                  </Text>
                  <Text variant="secondary" className="text-sm leading-relaxed">
                    {text}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Flow diagram */}
        <Section>
          <FlowDiagram
            title={`⭐ ${t("diagramTitle")}`}
            titleClass="text-indigo-700 dark:text-indigo-300"
            connectorClass="bg-indigo-200 dark:bg-indigo-800"
            steps={DIAGRAM_STEPS}
            centered
          />
        </Section>

        {/* Info cards */}
        <Section>
          <Heading level={2} className="mb-8 text-center">
            {t("infoTitle")}
          </Heading>
          <div className="grid gap-5 sm:grid-cols-2">
            {INFO_CARDS.map(({ icon: Icon, title, text, color, iconColor }) => (
              <div key={title} className={`rounded-xl border p-5 ${color}`}>
                <div
                  className={`w-10 h-10 rounded-lg bg-white/60 dark:bg-white/10 ${flex.center} mb-3`}
                >
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <Text className="font-semibold mb-1">{title}</Text>
                <Text variant="secondary" className="text-sm leading-relaxed">
                  {text}
                </Text>
              </div>
            ))}
          </div>
        </Section>

        {/* CTA */}
        <Section
          className={`rounded-2xl p-8 text-center ${themed.bgSecondary} border ${themed.border}`}
        >
          <Heading level={2} className="mb-3">
            {t("ctaTitle")}
          </Heading>
          <Text variant="secondary" className="mb-6 max-w-lg mx-auto">
            {t("ctaText")}
          </Text>
          <div className={`${flex.center} gap-4 flex-wrap`}>
            <TextLink href={ROUTES.PUBLIC.PRODUCTS}>{t("ctaBrowse")}</TextLink>
            <TextLink href={ROUTES.PUBLIC.HOW_ORDERS_WORK} variant="muted">
              {t("ctaOrders")}
            </TextLink>
          </div>
        </Section>
      </div>
    </div>
  );
}
