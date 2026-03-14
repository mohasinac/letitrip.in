import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { Heading, Text, Section, TextLink, FlowDiagram } from "@/components";
import type { FlowStep } from "@/components";
import { getTranslations } from "next-intl/server";

const { themed, flex, page } = THEME_CONSTANTS;

export async function HowOffersWorkView() {
  const t = await getTranslations("howOffersWork");

  const STEPS = [
    { number: 1, icon: "🔍", title: t("step1Title"), text: t("step1Text") },
    { number: 2, icon: "🏷️", title: t("step2Title"), text: t("step2Text") },
    { number: 3, icon: "💬", title: t("step3Title"), text: t("step3Text") },
    { number: 4, icon: "🤝", title: t("step4Title"), text: t("step4Text") },
    { number: 5, icon: "🛒", title: t("step5Title"), text: t("step5Text") },
    { number: 6, icon: "↩️", title: t("step6Title"), text: t("step6Text") },
  ];

  const DIAGRAM_STEPS: FlowStep[] = [
    {
      emoji: "🔍",
      circleClass:
        "bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-500",
      title: t("step1Title"),
    },
    {
      emoji: "💬",
      circleClass:
        "bg-amber-100 dark:bg-amber-900/40 border-2 border-amber-400 dark:border-amber-600",
      title: t("step3Title"),
      badge: "Negotiating",
      badgeClass:
        "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
    },
    {
      emoji: "🤝",
      circleClass:
        "bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-400 dark:border-emerald-600",
      title: t("step4Title"),
      badge: "ACCEPTED",
      badgeClass:
        "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
    },
    {
      emoji: "🛒",
      circleClass:
        "bg-sky-100 dark:bg-sky-900/40 border-2 border-sky-300 dark:border-sky-600",
      title: t("step5Title"),
    },
    {
      emoji: "📦",
      circleClass:
        "bg-green-100 dark:bg-green-900/40 border-2 border-green-400 dark:border-green-600",
      title: t("step6Title"),
      badge: "DELIVERED",
      badgeClass:
        "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
    },
  ];

  const RULES = [t("rulesItem1"), t("rulesItem2"), t("rulesItem3")];

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
          <div className="space-y-6">
            {STEPS.map(({ number, icon, title, text }) => (
              <div
                key={number}
                className={`${flex.center} gap-4 p-5 rounded-xl border ${themed.border} ${themed.bgPrimary}`}
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/40 ${flex.center} text-xl`}
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
            title={t("diagramTitle")}
            connectorClass="bg-primary/20 dark:bg-primary/30"
            steps={DIAGRAM_STEPS}
          />
        </Section>

        {/* Negotiation rules */}
        <Section>
          <Heading level={2} className="mb-6 text-center">
            {t("rulesTitle")}
          </Heading>
          <div
            className={`rounded-xl border p-6 ${themed.bgSecondary} ${themed.border} space-y-3`}
          >
            {RULES.map((rule, i) => (
              <div key={i} className={`${flex.center} gap-3`}>
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 dark:bg-primary/15 ${flex.center} text-sm font-semibold text-primary`}
                >
                  {i + 1}
                </div>
                <Text variant="secondary" className="text-sm leading-relaxed">
                  {rule}
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
            <TextLink href={ROUTES.PUBLIC.HOW_AUCTIONS_WORK} variant="muted">
              {t("seeAuctions")}
            </TextLink>
          </div>
        </Section>
      </div>
    </div>
  );
}
