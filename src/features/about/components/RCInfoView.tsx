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
import { RC_PACKAGES } from "@/db/schema";

const { themed, flex, page } = THEME_CONSTANTS;

export async function RCInfoView() {
  const t = await getTranslations("rcInfo");

  const LIFECYCLE = [
    {
      icon: "💳",
      label: t("purchaseLabel"),
      desc: t("purchaseDesc"),
      color:
        "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400",
    },
    {
      icon: "🔒",
      label: t("engageLabel"),
      desc: t("engageDesc"),
      color:
        "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400",
    },
    {
      icon: "🔓",
      label: t("releaseLabel"),
      desc: t("releaseDesc"),
      color: "bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400",
    },
    {
      icon: "✅",
      label: t("returnLabel"),
      desc: t("returnDesc"),
      color:
        "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400",
    },
    {
      icon: "❌",
      label: t("forfeitLabel"),
      desc: t("forfeitDesc"),
      color: "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400",
    },
  ];

  const FLOW_STEPS: FlowStep[] = [
    {
      emoji: "💳",
      circleClass:
        "bg-violet-100 dark:bg-violet-900/40 border-2 border-violet-400 dark:border-violet-600",
      badge: t("diagramBuy"),
      badgeClass:
        "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300",
      desc: t("diagramBuyDesc"),
    },
    {
      emoji: "🪙",
      circleClass:
        "bg-indigo-100 dark:bg-indigo-900/40 border-2 border-indigo-400 dark:border-indigo-600",
      badge: t("diagramAvailable"),
      badgeClass:
        "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300",
      desc: t("diagramAvailableDesc"),
    },
    {
      emoji: "🔨",
      circleClass:
        "bg-amber-100 dark:bg-amber-900/40 border-2 border-amber-400 dark:border-amber-600",
      badge: t("diagramBid"),
      badgeClass:
        "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
      desc: t("diagramBidDesc"),
    },
    {
      emoji: "🔒",
      circleClass:
        "bg-slate-100 dark:bg-slate-800 border-2 border-slate-400 dark:border-slate-500",
      badge: t("diagramLocked"),
      badgeClass:
        "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
      desc: t("diagramLockedDesc"),
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
            🪙 {t("title")}
          </Heading>
          <Text variant="none" className="text-white/80 max-w-2xl mx-auto">
            {t("subtitle")}
          </Text>
        </div>
      </Section>

      <div className={`${page.container.md} py-10 md:py-12 lg:py-16`}>
        {/* Why + Value */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
          <Section
            className={`${themed.bgSecondary} rounded-xl p-6 border ${themed.border}`}
          >
            <Heading level={2} className="mb-3">
              {t("whyTitle")}
            </Heading>
            <Text variant="secondary" className="leading-relaxed">
              {t("whyText")}
            </Text>
          </Section>
          <Section
            className={`${themed.bgSecondary} rounded-xl p-6 border ${themed.border}`}
          >
            <Heading level={2} className="mb-3">
              {t("valueTitle")}
            </Heading>
            <Text variant="secondary" className="leading-relaxed">
              {t("valueText")}
            </Text>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
              <Span className="px-3 py-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                10 RC = ₹1 purchased
              </Span>
              <Span className="px-3 py-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
                1 RC = ₹1 bid value
              </Span>
            </div>
          </Section>
        </div>

        {/* Available Packs */}
        <Heading level={2} className="mb-6">
          {t("buyTitle")}
        </Heading>
        <Text variant="secondary" className="mb-8">
          {t("buyText")}
        </Text>
        <Grid cols={3} gap="md" className="mb-4">
          {RC_PACKAGES.map((pkg) => (
            <Section
              key={pkg.packageId}
              className={`${themed.bgSecondary} rounded-xl p-5 border ${themed.border} flex flex-col gap-2`}
            >
              <div className="flex items-start justify-between">
                <Heading level={3} className="text-base font-semibold">
                  {pkg.totalCoins.toLocaleString("en-IN")} RC
                </Heading>
                {pkg.bonusPct > 0 && (
                  <Span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
                    +{pkg.bonusPct}% {t("bonusLabel")}
                  </Span>
                )}
              </div>
              <Text className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                ₹{pkg.priceRs}
              </Text>
              <Text size="xs" variant="secondary">
                {pkg.bonusPct > 0
                  ? `${pkg.coins.toLocaleString("en-IN")} + ${pkg.bonusCoins.toLocaleString("en-IN")} bonus`
                  : `${pkg.coins.toLocaleString("en-IN")} coins`}
              </Text>
            </Section>
          ))}
        </Grid>
        <div className="mb-14">
          <TextLink href={ROUTES.USER.RC_PURCHASE}>🪙 {t("buyCoins")}</TextLink>
        </div>

        {/* ── RC Lifecycle Diagram ── */}
        <FlowDiagram
          title={`🪙 ${t("diagramTitle")}`}
          titleClass="text-violet-700 dark:text-violet-300"
          connectorClass="bg-violet-200 dark:bg-violet-800"
          steps={FLOW_STEPS}
          centered
          className="mb-10"
        >
          {/* Arrow down */}
          <div className="flex justify-center mb-3">
            <div className="text-slate-400 text-lg">⬇️</div>
          </div>
          {/* Three outcome branches */}
          <Grid className="grid-cols-3" gap="3">
            <div className="rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20 p-3 text-center space-y-1">
              <div className="text-2xl">🔓</div>
              <Text
                size="xs"
                weight="semibold"
                className="text-sky-700 dark:text-sky-300"
              >
                {t("diagramPath1")}
              </Text>
              <Text size="xs" variant="secondary" className="leading-tight">
                {t("diagramPath1Desc")}
              </Text>
            </div>
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-3 text-center space-y-1">
              <div className="text-2xl">✅</div>
              <Text
                size="xs"
                weight="semibold"
                className="text-emerald-700 dark:text-emerald-300"
              >
                {t("diagramPath2")}
              </Text>
              <Text size="xs" variant="secondary" className="leading-tight">
                {t("diagramPath2Desc")}
              </Text>
            </div>
            <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 p-3 text-center space-y-1">
              <div className="text-2xl">❌</div>
              <Text
                size="xs"
                weight="semibold"
                className="text-rose-700 dark:text-rose-300"
              >
                {t("diagramPath3")}
              </Text>
              <Text size="xs" variant="secondary" className="leading-tight">
                {t("diagramPath3Desc")}
              </Text>
            </div>
          </Grid>
        </FlowDiagram>

        {/* Lifecycle */}
        <Heading level={2} className="mb-6">
          {t("lifecycleTitle")}
        </Heading>
        <div className="space-y-3 mb-14">
          {LIFECYCLE.map(({ icon, label, desc, color }) => (
            <Section
              key={label}
              className={`flex gap-4 items-start ${themed.bgSecondary} rounded-xl p-4 border ${themed.border}`}
            >
              <div
                className={`shrink-0 w-10 h-10 rounded-xl ${color} ${flex.center} text-base`}
              >
                {icon}
              </div>
              <div>
                <Text weight="semibold" size="sm">
                  {label}
                </Text>
                <Text size="sm" variant="secondary">
                  {desc}
                </Text>
              </div>
            </Section>
          ))}
        </div>

        {/* Wallet */}
        <Section
          className={`${themed.bgSecondary} rounded-xl p-6 border ${themed.border} mb-14`}
        >
          <Heading level={2} className="mb-2">
            {t("walletTitle")}
          </Heading>
          <Text variant="secondary" className="mb-5">
            {t("walletText")}
          </Text>
          <div className="flex flex-wrap gap-3">
            <TextLink
              href={ROUTES.USER.RC}
              className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors text-sm"
            >
              {t("viewWallet")}
            </TextLink>
            <TextLink
              href={ROUTES.USER.RC_PURCHASE}
              className="inline-flex items-center px-5 py-2.5 border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 rounded-xl font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-sm"
            >
              🪙 {t("buyCoins")}
            </TextLink>
          </div>
        </Section>

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
          <div className="flex flex-wrap justify-center gap-3">
            <TextLink
              href={ROUTES.PUBLIC.AUCTIONS}
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold transition-colors text-sm"
            >
              {t("viewAuctions")}
            </TextLink>
            <TextLink
              href={ROUTES.PUBLIC.HOW_AUCTIONS_WORK}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700 rounded-xl font-semibold hover:bg-violet-50 dark:hover:bg-slate-700 transition-colors text-sm"
            >
              How Auctions Work
            </TextLink>
          </div>
        </Section>
      </div>
    </div>
  );
}
