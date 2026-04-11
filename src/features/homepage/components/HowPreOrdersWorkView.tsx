"use client";

import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { HowItWorksInfoView } from "@mohasinac/appkit/features/homepage";
import { Grid, Heading, Span, Text } from "@mohasinac/appkit/ui";
import { TextLink, FlowDiagram } from "@/components";
import type { FlowStep } from "@/components";
import { useTranslations } from "next-intl";

const { themed } = THEME_CONSTANTS;

export function HowPreOrdersWorkView() {
  const t = useTranslations("howPreOrdersWork");

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
        "bg-primary/10 dark:bg-primary/20 border-2 border-primary/30",
      badge: t("diagramStatus4"),
      badgeClass: "bg-primary/10 dark:bg-primary/20 text-primary",
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
    <HowItWorksInfoView
      title={t("title")}
      subtitle={t("subtitle")}
      heroClass={THEME_CONSTANTS.accentBanner.pageHero}
      stepsTitle={t("stepsTitle")}
      steps={STEPS}
      details={EXTRAS}
      accentClass="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400"
      renderDiagram={() => (
        <FlowDiagram
          title={`📊 ${t("diagramTitle")}`}
          titleClass="text-emerald-700 dark:text-emerald-300"
          connectorClass="bg-emerald-200 dark:bg-emerald-800"
          steps={DIAGRAM_STEPS}
          stepWidth="w-[90px]"
          className="mb-12"
        >
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
            <div className="rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 p-3">
              <Span className="text-xs font-bold text-primary block mb-1">
                🏪 As a Seller
              </Span>
              <Text size="xs" variant="secondary">
                Update the production status from your Seller Dashboard so
                buyers stay informed at every stage.
              </Text>
            </div>
          </Grid>
        </FlowDiagram>
      )}
      renderFooter={() => (
        <>
          <div
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
          </div>

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
        </>
      )}
    />
  );
}
