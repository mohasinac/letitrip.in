import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { Heading, Text, Section, Stack, FlowDiagram, Div, Grid, TextLink } from "@mohasinac/appkit/ui";
import type { FlowStep } from "@mohasinac/appkit/ui";
import { getTranslations } from "next-intl/server";
import { ShieldCheck, ThumbsUp, Pencil } from "lucide-react";

const __P = {
  p5: "p-5",
  p8: "p-8",
} as const;

const { themed, flex, page } = THEME_CONSTANTS;

// ─── Sub-renderers ────────────────────────────────────────────────────────────

type ReviewStep = { number: number; icon: string; title: string; text: string };
type ReviewInfoCard = { icon: React.ComponentType<{ className?: string }>; title: string; text: string; color: string; iconColor: string };
type T = Awaited<ReturnType<typeof getTranslations<"howReviewsWork">>>;

function renderReviewsSteps(steps: ReviewStep[], t: T) {
  return (
    <Section>
      <Heading level={2} className="mb-8 text-center">{t("stepsTitle")}</Heading>
      <Stack gap="md">
        {steps.map(({ number, icon, title, text }) => (
          <Div key={number} className={`flex items-start ${THEME_CONSTANTS.spacing.gap.md} ${__P.p5} rounded-xl border ${themed.border} ${themed.bgPrimary}`}>
            <Div className={`flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/15 ${flex.center} text-xl`}>{icon}</Div>
            <Div>
              <Text className="font-semibold mb-0.5">{number}. {title}</Text>
              <Text variant="secondary" className="text-sm leading-relaxed">{text}</Text>
            </Div>
          </Div>
        ))}
      </Stack>
    </Section>
  );
}

function renderReviewsDiagram(diagramSteps: FlowStep[], t: T) {
  return (
    <Section>
      <FlowDiagram
        title={`⭐ ${t("diagramTitle")}`}
        titleClass="text-primary"
        connectorClass="bg-primary/20 dark:bg-primary/30"
        steps={diagramSteps}
        centered
      />
    </Section>
  );
}

function renderReviewsInfoCards(infoCards: ReviewInfoCard[], t: T) {
  return (
    <Section>
      <Heading level={2} className="mb-8 text-center">{t("infoTitle")}</Heading>
      <Grid className={`${THEME_CONSTANTS.spacing.gap.md} sm:grid-cols-2`}>
        {infoCards.map(({ icon: Icon, title, text, color, iconColor }) => (
          <Div key={title} className={`rounded-xl border ${__P.p5} ${color}`}>
            <Div className={`w-10 h-10 rounded-lg bg-white/60 dark:bg-white/10 ${flex.center} mb-3`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </Div>
            <Text className="font-semibold mb-1">{title}</Text>
            <Text variant="secondary" className="text-sm leading-relaxed">{text}</Text>
          </Div>
        ))}
      </Grid>
    </Section>
  );
}

function renderReviewsCta(t: T) {
  return (
    <Section className={`rounded-2xl ${__P.p8} text-center ${themed.bgSecondary} border ${themed.border}`}>
      <Heading level={2} className="mb-3">{t("ctaTitle")}</Heading>
      <Text variant="secondary" className="mb-6 max-w-lg mx-auto">{t("ctaText")}</Text>
      <Div className={`${flex.center} gap-4 flex-wrap`}>
        <TextLink href={ROUTES.PUBLIC.PRODUCTS}>{t("ctaBrowse")}</TextLink>
        <TextLink href={ROUTES.PUBLIC.HOW_ORDERS_WORK} variant="muted">{t("ctaOrders")}</TextLink>
      </Div>
    </Section>
  );
}

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
        "bg-primary/5 border-primary/20 dark:bg-primary/10 dark:border-primary/30",
      iconColor: "text-primary",
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
        "bg-primary/10 dark:bg-primary/15 border-2 border-primary/30 dark:border-primary/40",
      badge: t("diagramS2"),
      badgeClass: "bg-primary/10 dark:bg-primary/15 text-primary",
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
    <Div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-6 sm:-mt-8 lg:-mt-10">
      {/* Hero */}
      <Section
        className={`${THEME_CONSTANTS.accentBanner.pageHero} text-white py-14 md:py-16 lg:py-20`}
      >
        <Div className={`${page.container.md} text-center`}>
          <Heading level={1} variant="none" className="mb-4 text-white">
            {t("title")}
          </Heading>
          <Text variant="none" className="text-white/80 max-w-2xl mx-auto">
            {t("subtitle")}
          </Text>
        </Div>
      </Section>

      <Div className={`${page.container.md} py-10 md:py-12 lg:py-16 space-y-14`}>
        {renderReviewsSteps(STEPS, t)}
        {renderReviewsDiagram(DIAGRAM_STEPS, t)}
        {renderReviewsInfoCards(INFO_CARDS, t)}
        {renderReviewsCta(t)}
      </Div>
    </Div>
  );
}

