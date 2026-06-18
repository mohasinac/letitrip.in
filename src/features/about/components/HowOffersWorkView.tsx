import { ROUTES } from "@/constants";
import { PAGE_CONTAINER } from "@/constants";
import { Div, FlowDiagram, Heading, Row, Section, Stack, Text, TextLink } from "@mohasinac/appkit/ui";
import type { FlowStep } from "@mohasinac/appkit/ui";
import { getTranslations } from "next-intl/server";

const __P = {
  p6: "p-6",
} as const;

const page = { container: PAGE_CONTAINER };

const CLS_STEP_NUMBER = "bg-violet-100 dark:bg-violet-900/40";

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
        "bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-400 dark:border-emerald-600",
      title: t("step6Title"),
      badge: "DELIVERED",
      badgeClass:
        "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
    },
  ];

  const RULES = [t("rulesItem1"), t("rulesItem2"), t("rulesItem3")];

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
        {/* Steps */}
        <Section>
          <Heading level={2} className="mb-8" align="center">
            {t("stepsTitle")}
          </Heading>
          <Stack gap="lg">
            {STEPS.map(({ number, icon, title, text }) => (
              <Row padding="5" align="center" justify="center" gap="md" 
                key={number} border="default" surface="muted" rounded="xl"
              >
                <Row align="center" justify="center" textSize="xl" className={`flex-shrink-0 w-10 h-10 ${CLS_STEP_NUMBER}`} rounded="full">
                  {icon}
                </Row>
                <Div>
                  <Text className="mb-0.5" weight="semibold">
                    {number}. {title}
                  </Text>
                  <Text variant="secondary" className="leading-relaxed" size="sm">
                    {text}
                  </Text>
                </Div>
              </Row>
            ))}
          </Stack>
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
          <Heading level={2} className="mb-6" align="center">
            {t("rulesTitle")}
          </Heading>
          <Stack className={`${__P.p6}`} border="default" surface="subtle" gap="3" rounded="xl">
            {RULES.map((rule, i) => (
              <Row align="center" justify="center" gap="3" key={i}>
                <Row textWeight="semibold" align="center" justify="center" textSize="sm" className={`flex-shrink-0 w-6 h-6 bg-primary/10 dark:bg-primary/15 text-primary`} rounded="full">
                  {i + 1}
                </Row>
                <Text variant="secondary" className="leading-relaxed" size="sm">
                  {rule}
                </Text>
              </Row>
            ))}
          </Stack>
        </Section>

        {/* CTA */}
        <Section
          className={`text-center`} border="default" surface="subtle" rounded="2xl" padding="xl"
        >
          <Heading level={2} className="mb-3">
            {t("ctaTitle")}
          </Heading>
          <Text variant="secondary" className="mb-6 max-w-lg mx-auto">
            {t("ctaText")}
          </Text>
          <Row align="center" justify="center" gap="md" wrap >
            <TextLink href={ROUTES.PUBLIC.HOW_AUCTIONS_WORK} variant="muted">
              {t("seeAuctions")}
            </TextLink>
          </Row>
        </Section>
      </Stack>
    </Div>
  );
}

