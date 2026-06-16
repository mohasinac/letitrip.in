import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { Div, FlowDiagram, Grid, Heading, Row, Section, Span, Stack, Text, TextLink } from "@mohasinac/appkit/ui";
import type { FlowStep } from "@mohasinac/appkit/ui";
import { getTranslations } from "next-intl/server";
import { PackageSearch, MapPinned, FileText, XCircle } from "lucide-react";

const __P = {
  p4: "p-4",
  p5: "p-5",
  p8: "p-8",
} as const;

const { themed, flex, page } = THEME_CONSTANTS;

// ─── Sub-renderers ────────────────────────────────────────────────────────────

type StatusStep = { label: string; desc: string; color: string; badge: string; icon: string };
type InfoCard = { icon: React.ComponentType<{ className?: string }>; title: string; text: string; color: string; iconColor: string };
type T = Awaited<ReturnType<typeof getTranslations<"howOrdersWork">>>;

function renderOrdersLifecycle(statusSteps: StatusStep[], t: T) {
  return (
    <Section>
      <Heading level={2} className="mb-3" align="center">{t("lifecycleTitle")}</Heading>
      <Text variant="secondary" className="mb-8 max-w-xl mx-auto" align="center">{t("lifecycleSubtitle")}</Text>
      <Stack gap="3">
        {statusSteps.map(({ label, desc, color, badge, icon }) => (
          <Row key={label} className={`${__P.p4} border ${color}`} align="start" gap="md" rounded="xl">
            <Div className="text-2xl flex-shrink-0 mt-0.5">{icon}</Div>
            <Div className="flex-1">
              <Row gap="sm" className="mb-1">
                <Span size="xs" weight="semibold" className={`inline-block ${badge}`} rounded="full" padding="pill-xs">{label}</Span>
              </Row>
              <Text variant="secondary" className="leading-relaxed" size="sm">{desc}</Text>
            </Div>
          </Row>
        ))}
        <Row className={`${__P.p4} border border-error/20`} surface="danger-surface" align="start" gap="md" rounded="xl">
          <Div className="text-2xl flex-shrink-0 mt-0.5">❌</Div>
          <Div className="flex-1">
            <Row gap="sm" className="mb-1">
              <Span color="error" surface="danger-surface" size="xs" weight="semibold" className="inline-block" rounded="full" padding="pill-xs">{t("sCancelLabel")}</Span>
            </Row>
            <Text variant="secondary" className="leading-relaxed" size="sm">{t("sCancelDesc")}</Text>
          </Div>
        </Row>
      </Stack>
    </Section>
  );
}

function renderOrdersDiagram(diagramSteps: FlowStep[], t: T) {
  return (
    <Section>
      <FlowDiagram
        title={`📦 ${t("diagramTitle")}`}
        titleClass="text-primary"
        connectorClass="bg-primary/20 dark:bg-primary/30"
        steps={diagramSteps}
      />
    </Section>
  );
}

function renderOrdersInfoCards(infoCards: InfoCard[], t: T) {
  return (
    <Section>
      <Heading level={2} className="mb-8" align="center">{t("infoTitle")}</Heading>
      <Grid className={`sm:grid-cols-2`} gap="md">
        {infoCards.map(({ icon: Icon, title, text, color, iconColor }) => (
          <Div key={title} className={`border ${__P.p5} ${color}`} rounded="xl">
            <Div className={`w-10 h-10 ${flex.center} mb-3`} surface="default" rounded="lg">
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </Div>
            <Text className="mb-1" weight="semibold">{title}</Text>
            <Text variant="secondary" className="leading-relaxed" size="sm">{text}</Text>
          </Div>
        ))}
      </Grid>
    </Section>
  );
}

function renderOrdersCta(t: T) {
  return (
    <Section className={`${__P.p8} text-center`} border="default" surface="subtle" rounded="2xl">
      <Heading level={2} className="mb-3">{t("ctaTitle")}</Heading>
      <Text variant="secondary" className="mb-6 max-w-lg mx-auto">{t("ctaText")}</Text>
      <Div className={`${flex.center} gap-4 flex-wrap`}>
        <TextLink href={ROUTES.PUBLIC.PRODUCTS}>{t("ctaBrowse")}</TextLink>
        <TextLink href={ROUTES.PUBLIC.HOW_CHECKOUT_WORKS} variant="muted">{t("ctaCheckout")}</TextLink>
      </Div>
    </Section>
  );
}

export async function HowOrdersWorkView() {
  const t = await getTranslations("howOrdersWork");

  const STATUS_STEPS = [
    {
      label: t("s1Label"),
      desc: t("s1Desc"),
      color:
        "bg-slate-50 border-slate-200 dark:bg-slate-800/60 dark:border-slate-700",
      badge:
        "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300",
      icon: "🕐",
    },
    {
      label: t("s2Label"),
      desc: t("s2Desc"),
      color:
        "bg-primary/5 border-primary/20 dark:bg-primary/10 dark:border-primary/30",
      badge: "bg-primary/10 dark:bg-primary/15 text-primary",
      icon: "✅",
    },
    {
      label: t("s3Label"),
      desc: t("s3Desc"),
      color:
        "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700",
      badge:
        "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
      icon: "📦",
    },
    {
      label: t("s4Label"),
      desc: t("s4Desc"),
      color:
        "bg-violet-50 border-violet-200 dark:bg-violet-900/20 dark:border-violet-700",
      badge:
        "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300",
      icon: "🚚",
    },
    {
      label: t("s5Label"),
      desc: t("s5Desc"),
      color:
        "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700",
      badge:
        "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
      icon: "🏠",
    },
    {
      label: t("s6Label"),
      desc: t("s6Desc"),
      color:
        "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700",
      badge:
        "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
      icon: "🎉",
    },
  ];

  const INFO_CARDS = [
    {
      icon: PackageSearch,
      title: t("trackingTitle"),
      text: t("trackingText"),
      color: "bg-sky-50 border-sky-200 dark:bg-sky-900/20 dark:border-sky-700",
      iconColor: "text-sky-600 dark:text-sky-400",
    },
    {
      icon: XCircle,
      title: t("cancelTitle"),
      text: t("cancelText"),
      color: "bg-error-surface border-error/20",
      iconColor: "text-error",
    },
    {
      icon: FileText,
      title: t("invoiceTitle"),
      text: t("invoiceText"),
      color:
        "bg-primary/5 border-primary/20 dark:bg-primary/10 dark:border-primary/30",
      iconColor: "text-primary",
    },
    {
      icon: MapPinned,
      title: t("addressTitle"),
      text: t("addressText"),
      color:
        "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
  ];

  const DIAGRAM_STEPS: FlowStep[] = [
    {
      emoji: "🕐",
      circleClass:
        "bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-500",
      badge: t("s1Label"),
      badgeClass:
        "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300",
    },
    {
      emoji: "✅",
      circleClass:
        "bg-primary/10 dark:bg-primary/15 border-2 border-primary/30 dark:border-primary/40",
      badge: t("s2Label"),
      badgeClass: "bg-primary/10 dark:bg-primary/15 text-primary",
    },
    {
      emoji: "📦",
      circleClass:
        "bg-amber-100 dark:bg-amber-900/40 border-2 border-amber-400 dark:border-amber-600",
      badge: t("s3Label"),
      badgeClass:
        "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
    },
    {
      emoji: "🚚",
      circleClass:
        "bg-violet-100 dark:bg-violet-900/40 border-2 border-violet-400 dark:border-violet-600",
      badge: t("s4Label"),
      badgeClass:
        "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300",
    },
    {
      emoji: "🏠",
      circleClass:
        "bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-400 dark:border-emerald-600",
      badge: t("s5Label"),
      badgeClass:
        "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
    },
    {
      emoji: "🎉",
      circleClass:
        "bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-400 dark:border-emerald-600",
      badge: t("s6Label"),
      badgeClass:
        "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
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

      <Div className={`${page.container.md} md:py-12 lg:py-16 space-y-14`} padding="y-2xl">
        {renderOrdersLifecycle(STATUS_STEPS, t)}
        {renderOrdersDiagram(DIAGRAM_STEPS, t)}
        {renderOrdersInfoCards(INFO_CARDS, t)}
        {renderOrdersCta(t)}
      </Div>
    </Div>
  );
}

