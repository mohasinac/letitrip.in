import { ROUTES } from "@/constants";
import { PAGE_CONTAINER } from "@/constants";
import { Div, FlowDiagram, Grid, Heading, Row, Section, Stack, Text, TextLink } from "@mohasinac/appkit/ui";
import type { FlowStep } from "@mohasinac/appkit/ui";
import { getTranslations } from "next-intl/server";
import { ShieldCheck, ThumbsUp, Pencil } from "lucide-react";

const __P = {
  p5: "p-[var(--appkit-space-5)]",
  p8: "p-[var(--appkit-space-8)]",
} as const;

const page = { container: PAGE_CONTAINER };

// ─── Sub-renderers ────────────────────────────────────────────────────────────

type ReviewStep = { number: number; icon: string; title: string; text: string };
type ReviewInfoCard = { icon: React.ComponentType<{ className?: string }>; title: string; text: string; color: string; iconColor: string };
type T = Awaited<ReturnType<typeof getTranslations<"howReviewsWork">>>;

function renderReviewsSteps(steps: ReviewStep[], t: T) {
  return (
    <Section>
      <Heading level={2} className="mb-8" align="center">{t("stepsTitle")}</Heading>
      <Stack gap="md">
        {steps.map(({ number, icon, title, text }) => (
          <Row key={number} className={`${__P.p5}`} border="default" surface="muted" gap="md" align="start" rounded="xl">
            <Row align="center" justify="center" textSize="xl" className={`flex-shrink-0 w-10 h-10 bg-primary/10 dark:bg-primary/15`} rounded="full">{icon}</Row>
            <Div>
              <Text className="mb-0.5" weight="semibold">{number}. {title}</Text>
              <Text variant="secondary" className="leading-relaxed" size="sm">{text}</Text>
            </Div>
          </Row>
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
      <Heading level={2} className="mb-8" align="center">{t("infoTitle")}</Heading>
      <Grid className={`sm:grid-cols-2`} gap="md">
        {infoCards.map(({ icon: Icon, title, text, color, iconColor }) => (
          <Div key={title} className={`border ${__P.p5} ${color}`} rounded="xl">
            <Row align="center" justify="center" className={`w-10 h-10 mb-3`} surface="default" rounded="lg">
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </Row>
            <Text className="mb-1" weight="semibold">{title}</Text>
            <Text variant="secondary" className="leading-relaxed" size="sm">{text}</Text>
          </Div>
        ))}
      </Grid>
    </Section>
  );
}

function renderReviewsCta(t: T) {
  return (
    <Section className={`${__P.p8} text-center`} border="default" surface="subtle" rounded="2xl">
      <Heading level={2} className="mb-3">{t("ctaTitle")}</Heading>
      <Text variant="secondary" className="mb-6 max-w-lg mx-auto">{t("ctaText")}</Text>
      <Row align="center" justify="center" gap="md" wrap >
        <TextLink href={ROUTES.PUBLIC.PRODUCTS}>{t("ctaBrowse")}</TextLink>
        <TextLink href={ROUTES.PUBLIC.HOW_ORDERS_WORK} variant="muted">{t("ctaOrders")}</TextLink>
      </Row>
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
        "bg-[var(--appkit-color-border-subtle)] border-2 border-[var(--appkit-color-border)]",
      badge: t("diagramS1"),
      badgeClass:
        "bg-[var(--appkit-color-border-subtle)] text-[var(--appkit-color-text-muted)]",
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
      <Section color="inverse" 
        tone="accent-banner" padding="y-2-5xl"
      >
        <Div className={`${page.container.md} text-center`}>
          <Heading color="inverse" level={1} variant="none" className="mb-4">
            {t("title")}
          </Heading>
          <Text color="inverse" variant="none" className="/80 max-w-2xl mx-auto">
            {t("subtitle")}
          </Text>
        </Div>
      </Section>

      <Stack gap="14" className={`${page.container.md}`} padding="content-banner">
        {renderReviewsSteps(STEPS, t)}
        {renderReviewsDiagram(DIAGRAM_STEPS, t)}
        {renderReviewsInfoCards(INFO_CARDS, t)}
        {renderReviewsCta(t)}
      </Stack>
    </Div>
  );
}

