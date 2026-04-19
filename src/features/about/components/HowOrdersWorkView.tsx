import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { Heading, Text, Section, Span, Row, FlowDiagram } from "@mohasinac/appkit";
import type { FlowStep } from "@mohasinac/appkit";
import { TextLink } from "@mohasinac/appkit";
import { getTranslations } from "next-intl/server";
import { PackageSearch, MapPinned, FileText, XCircle } from "lucide-react";

const { themed, flex, page } = THEME_CONSTANTS;

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
        "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700",
      badge:
        "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
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
      color: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700",
      iconColor: "text-red-600 dark:text-red-400",
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
        "bg-green-100 dark:bg-green-900/40 border-2 border-green-400 dark:border-green-600",
      badge: t("s6Label"),
      badgeClass:
        "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
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
        {/* Order status lifecycle */}
        <Section>
          <Heading level={2} className="mb-3 text-center">
            {t("lifecycleTitle")}
          </Heading>
          <Text
            variant="secondary"
            className="text-center mb-8 max-w-xl mx-auto"
          >
            {t("lifecycleSubtitle")}
          </Text>
          <div className="space-y-3">
            {STATUS_STEPS.map(({ label, desc, color, badge, icon }) => (
              <div
                key={label}
                className={`flex items-start gap-4 p-4 rounded-xl border ${color}`}
              >
                <div className="text-2xl flex-shrink-0 mt-0.5">{icon}</div>
                <div className="flex-1">
                  <Row gap="sm" className="mb-1">
                    <Span
                      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${badge}`}
                    >
                      {label}
                    </Span>
                  </Row>
                  <Text variant="secondary" className="text-sm leading-relaxed">
                    {desc}
                  </Text>
                </div>
              </div>
            ))}

            {/* Cancelled state */}
            <div
              className={`flex items-start gap-4 p-4 rounded-xl border bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700`}
            >
              <div className="text-2xl flex-shrink-0 mt-0.5">❌</div>
              <div className="flex-1">
                <Row gap="sm" className="mb-1">
                  <Span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                    {t("sCancelLabel")}
                  </Span>
                </Row>
                <Text variant="secondary" className="text-sm leading-relaxed">
                  {t("sCancelDesc")}
                </Text>
              </div>
            </div>
          </div>
        </Section>

        {/* Flow diagram */}
        <Section>
          <FlowDiagram
            title={`📦 ${t("diagramTitle")}`}
            titleClass="text-primary"
            connectorClass="bg-primary/20 dark:bg-primary/30"
            steps={DIAGRAM_STEPS}
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
            <TextLink href={ROUTES.PUBLIC.HOW_CHECKOUT_WORKS} variant="muted">
              {t("ctaCheckout")}
            </TextLink>
          </div>
        </Section>
      </div>
    </div>
  );
}

