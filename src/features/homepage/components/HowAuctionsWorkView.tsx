"use client";

import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { HowItWorksInfoView } from "@mohasinac/appkit/features/homepage";
import { Heading, Text, Span, Row, Grid } from "@mohasinac/appkit/ui";
import { TextLink, FlowDiagram } from "@/components";
import type { FlowStep } from "@/components";
import { useTranslations } from "next-intl";

const { themed } = THEME_CONSTANTS;

export function HowAuctionsWorkView() {
  const t = useTranslations("howAuctionsWork");

  const STEPS = [
    { number: 1, icon: "🔍", title: t("step1Title"), text: t("step1Text") },
    { number: 2, icon: "📋", title: t("step2Title"), text: t("step2Text") },
    { number: 3, icon: "🔨", title: t("step3Title"), text: t("step3Text") },
    { number: 4, icon: "🏆", title: t("step4Title"), text: t("step4Text") },
    { number: 5, icon: "↩️", title: t("step5Title"), text: t("step5Text") },
    { number: 6, icon: "📦", title: t("step6Title"), text: t("step6Text") },
  ];

  const DETAILS = [
    { title: t("reservePriceTitle"), text: t("reservePriceText") },
    { title: t("autoExtendTitle"), text: t("autoExtendText") },
  ];

  const DIAGRAM_STEPS: FlowStep[] = [
    {
      emoji: "🔍",
      circleClass:
        "bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-500",
      title: t("step1Title"),
    },
    {
      emoji: "📋",
      circleClass:
        "bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-500",
      title: t("step2Title"),
    },
    {
      emoji: "🔨",
      circleClass:
        "bg-red-100 dark:bg-red-900/40 border-2 border-red-400 dark:border-red-600",
      title: t("step3Title"),
      badge: "● LIVE",
      badgeClass: "bg-red-500 text-white",
    },
    {
      emoji: "⏰",
      circleClass:
        "bg-amber-100 dark:bg-amber-900/40 border-2 border-amber-300 dark:border-amber-600",
      title: "Timer Ends",
      badge: "ENDED",
      badgeClass: "bg-zinc-600 text-white",
    },
    {
      emoji: "🏆",
      circleClass:
        "bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-400 dark:border-emerald-600",
      title: t("step4Title"),
      badge: "WINNER!",
      badgeClass:
        "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
    },
    {
      emoji: "📦",
      circleClass:
        "bg-sky-100 dark:bg-sky-900/40 border-2 border-sky-300 dark:border-sky-600",
      title: t("step6Title"),
      badge: "DELIVERED",
      badgeClass:
        "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300",
    },
  ];

  return (
    <HowItWorksInfoView
      title={t("title")}
      subtitle={t("subtitle")}
      heroClass={THEME_CONSTANTS.accentBanner.pageHero}
      stepsTitle={t("stepsTitle")}
      steps={STEPS}
      detailsSectionTitle={t("knowMoreTitle")}
      details={DETAILS}
      accentClass="bg-primary/10 dark:bg-primary/20 text-primary"
      renderDiagram={() => (
        <FlowDiagram
          title={`🗺️ ${t("diagramTitle")}`}
          titleClass="text-primary"
          connectorClass="bg-slate-200 dark:bg-slate-600"
          steps={DIAGRAM_STEPS}
          stepWidth="w-[78px]"
          className="mb-12"
        >
          <div className="border-t border-dashed border-slate-200 dark:border-slate-700 pt-4 mt-2">
            <Text
              size="xs"
              variant="secondary"
              weight="medium"
              className="mb-3"
            >
              {t("diagramStatusNote")}
            </Text>
            <Grid gap="3" className="grid-cols-1 sm:grid-cols-3">
              <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20 p-3">
                <Row gap="xs" className="mb-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <Span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                    {t("diagramWinning")}
                  </Span>
                </Row>
                <Text size="xs" variant="secondary">
                  {t("diagramWinningDesc")}
                </Text>
              </div>
              <div className="rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20 p-3">
                <Row gap="xs" className="mb-1.5">
                  <Span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                    ⚡ {t("diagramOutbid")}
                  </Span>
                </Row>
                <Text size="xs" variant="secondary">
                  {t("diagramOutbidDesc")}
                </Text>
              </div>
              <div className="rounded-xl border-2 border-rose-300 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-950/20 p-3">
                <Row gap="xs" className="mb-1.5">
                  <Span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide">
                    ⚠️ {t("diagramForfeit")}
                  </Span>
                </Row>
                <Text size="xs" variant="secondary">
                  {t("diagramForfeitDesc")}
                </Text>
              </div>
            </Grid>
          </div>
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
            <Row wrap justify="center" gap="md">
              <TextLink
                href={ROUTES.PUBLIC.AUCTIONS}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-colors text-sm"
              >
                {t("ctaBrowse")}
              </TextLink>
            </Row>
          </div>

          <div
            className={`mt-10 pt-8 border-t ${themed.border} flex gap-6 text-sm`}
          >
            <TextLink
              href={ROUTES.PUBLIC.AUCTIONS}
              className="text-primary hover:underline"
            >
              {t("viewAuctions")}
            </TextLink>
            <TextLink
              href={ROUTES.PUBLIC.FAQS}
              className="text-primary hover:underline"
            >
              {t("faqLink")}
            </TextLink>
          </div>
        </>
      )}
    />
  );
}
