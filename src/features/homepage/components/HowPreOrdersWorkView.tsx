import { ROUTES, THEME_CONSTANTS } from "@/constants";
import {
  Heading,
  Text,
  Grid,
  Section,
  TextLink,
  Span,
  FlowDiagram,
} from "@/components";
import type { FlowStep } from "@/components";
import { getTranslations } from "next-intl/server";

const { themed, flex, page } = THEME_CONSTANTS;

export async function HowPreOrdersWorkView() {
  const t = await getTranslations("howPreOrdersWork");

  const STEPS = [
    { number: 1, icon: "🔍", title: t("step1Title"), text: t("step1Text") },
    { number: 2, icon: "🛒", title: t("step2Title"), text: t("step2Text") },
    { number: 3, icon: "🏭", title: t("step3Title"), text: t("step3Text") },
    { number: 4, icon: "🚚", title: t("step4Title"), text: t("step4Text") },
    { number: 5, icon: "📦", title: t("step5Title"), text: t("step5Text") },
  ];

  const EXTRAS = [
    { title: t("cancellationTitle"), text: t("cancellationText") },
    { title: t("sellerDelayTitle"), text: t("sellerDelayText") },
    { title: t("priceLockTitle"), text: t("priceLockText") },
  ];

  const DIAGRAM_STEPS: FlowStep[] = [
    {
      emoji: "📋",
      circleClass:
        "bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-500",
      badge: t("diagramStatus1"),
      badgeClass:
        "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
      desc: t("diagramStatus1Desc"),
    },
    {
      emoji: "⏳",
      circleClass:
        "bg-amber-100 dark:bg-amber-900/40 border-2 border-amber-300 dark:border-amber-600",
      badge: t("diagramStatus2"),
      badgeClass:
        "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
      desc: t("diagramStatus2Desc"),
    },
    {
      emoji: "📦",
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
        "bg-indigo-100 dark:bg-indigo-900/40 border-2 border-indigo-300 dark:border-indigo-600",
      badge: t("diagramStatus4"),
      badgeClass:
        "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300",
      desc: t("diagramStatus4Desc"),
    },
    {
      emoji: "✅",
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

      <div className={`${page.container.md} py-10 md:py-12 lg:py-16`}>
        {/* ── Pre-Order Status Timeline Diagram ── */}
        <FlowDiagram
          title={`📊 ${t("diagramTitle")}`}
          titleClass="text-emerald-700 dark:text-emerald-300"
          connectorClass="bg-emerald-200 dark:bg-emerald-800"
          steps={DIAGRAM_STEPS}
          stepWidth="w-[90px]"
          className="mb-12"
        >
          {/* Buyer vs Seller note */}
          <Grid
            cols={2}
            gap="3"
            className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700"
          >
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-3">
              <Span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                👤 As a Buyer
              </Span>
              <Text size="xs" variant="secondary">
                You reserved a spot. Sit back — we&apos;ll notify you when your
                item ships and is delivered.
              </Text>
            </div>
            <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 p-3">
              <Span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 block mb-1">
                🏪 As a Seller
              </Span>
              <Text size="xs" variant="secondary">
                Update the production status from your Seller Dashboard so
                buyers stay informed at every stage.
              </Text>
            </div>
          </Grid>
        </FlowDiagram>

        {/* Steps */}
        <Heading level={2} className="mb-6">
          {t("stepsTitle")}
        </Heading>
        <div className={`${THEME_CONSTANTS.spacing.stack} mb-14`}>
          {STEPS.map(({ number, icon, title, text }) => (
            <Section
              key={title}
              className={`flex gap-4 items-start ${themed.bgSecondary} rounded-xl p-6 border ${themed.border}`}
            >
              <div
                className={`shrink-0 w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 ${flex.center} text-sm font-bold text-emerald-700 dark:text-emerald-400`}
              >
                {number}
              </div>
              <div>
                <Heading level={3} className="font-semibold mb-1">
                  {icon} {title}
                </Heading>
                <Text variant="secondary" size="sm" className="leading-relaxed">
                  {text}
                </Text>
              </div>
            </Section>
          ))}
        </div>

        {/* Policies */}
        <div className="space-y-5 mb-14">
          {EXTRAS.map(({ title, text }) => (
            <Section key={title}>
              <Heading level={2} className="mb-2">
                {title}
              </Heading>
              <Text variant="secondary" className="leading-relaxed">
                {text}
              </Text>
            </Section>
          ))}
        </div>

        {/* CTA */}
        <Section
          className={`${themed.bgSecondary} rounded-xl p-8 border ${themed.border} text-center`}
        >
          <Heading level={2} className="mb-2">
            {t("ctaTitle")}
          </Heading>
          <Text variant="secondary" className="mb-6">
            {t("ctaText")}
          </Text>
          <TextLink
            href={ROUTES.PUBLIC.PRE_ORDERS}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors text-sm"
          >
            {t("ctaBrowse")}
          </TextLink>
        </Section>

        <div
          className={`mt-10 pt-8 border-t ${themed.border} flex gap-6 text-sm`}
        >
          <TextLink
            href={ROUTES.PUBLIC.PRE_ORDERS}
            className="text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {t("viewPreOrders")}
          </TextLink>
          <TextLink
            href={ROUTES.PUBLIC.HELP}
            className="text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {t("helpLink")}
          </TextLink>
          <TextLink
            href={ROUTES.PUBLIC.REFUND_POLICY}
            className="text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Refund Policy
          </TextLink>
        </div>
      </div>
    </div>
  );
}
