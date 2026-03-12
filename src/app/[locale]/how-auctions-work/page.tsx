import type { Metadata } from "next";
import { ROUTES, THEME_CONSTANTS, SITE_CONFIG } from "@/constants";
import { Heading, Text, Section, TextLink, Span } from "@/components";
import { getTranslations } from "next-intl/server";

export const revalidate = 3600;

const { themed, flex, page } = THEME_CONSTANTS;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("howAuctionsWork");
  return {
    title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
  };
}

export default async function HowAuctionsWorkPage() {
  const t = await getTranslations("howAuctionsWork");

  const STEPS = [
    { number: 1, icon: "🔍", title: t("step1Title"), text: t("step1Text") },
    { number: 2, icon: "🪙", title: t("step2Title"), text: t("step2Text") },
    { number: 3, icon: "🔨", title: t("step3Title"), text: t("step3Text") },
    { number: 4, icon: "🏆", title: t("step4Title"), text: t("step4Text") },
    { number: 5, icon: "↩️", title: t("step5Title"), text: t("step5Text") },
    { number: 6, icon: "📦", title: t("step6Title"), text: t("step6Text") },
  ];

  const DETAILS = [
    { title: t("reservePriceTitle"), text: t("reservePriceText") },
    { title: t("autoExtendTitle"), text: t("autoExtendText") },
    { title: t("ripcoinsTitle"), text: t("ripcoinsText") },
  ];

  return (
    <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-6 sm:-mt-8 lg:-mt-10">
      {/* Header */}
      <Section className="bg-gradient-to-br from-indigo-700 to-violet-900 text-white py-14 md:py-16 lg:py-20">
        <div className={`${page.container.md} text-center`}>
          <Heading level={1} className="mb-4 text-white">
            {t("title")}
          </Heading>
          <Text className="text-indigo-200 max-w-2xl mx-auto">
            {t("subtitle")}
          </Text>
        </div>
      </Section>

      <div className={`${page.container.md} py-10 md:py-12 lg:py-16`}>
        {/* ── Auction Journey Diagram ── */}
        <div
          className={`mb-12 rounded-2xl border ${themed.border} overflow-hidden`}
        >
          <div
            className={`${themed.bgSecondary} px-5 py-3 border-b ${themed.border}`}
          >
            <Text
              weight="semibold"
              size="sm"
              className="text-indigo-700 dark:text-indigo-300"
            >
              🗺️ {t("diagramTitle")}
            </Text>
          </div>
          <div className={`${themed.bgPrimary} p-5 overflow-hidden`}>
            {/* Step chain — horizontal, scrollable on mobile */}
            <div className="flex items-start overflow-x-auto pb-3 gap-1.5 scroll-smooth">
              {/* 1 Browse */}
              <div className="shrink-0 flex flex-col items-center text-center gap-1 w-[78px]">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-500 flex items-center justify-center text-xl">
                  🔍
                </div>
                <Text size="xs" weight="medium" className="leading-tight">
                  {t("step1Title")}
                </Text>
              </div>
              <div className="shrink-0 self-start mt-5 h-0.5 w-5 bg-slate-200 dark:bg-slate-600 mt-6" />
              {/* 2 RipCoins */}
              <div className="shrink-0 flex flex-col items-center text-center gap-1 w-[78px]">
                <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/40 border-2 border-violet-300 dark:border-violet-700 flex items-center justify-center text-xl">
                  🪙
                </div>
                <Text size="xs" weight="medium" className="leading-tight">
                  {t("step2Title")}
                </Text>
                <Span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
                  Wallet
                </Span>
              </div>
              <div className="shrink-0 self-start h-0.5 w-5 bg-slate-200 dark:bg-slate-600 mt-6" />
              {/* 3 Bid */}
              <div className="shrink-0 flex flex-col items-center text-center gap-1 w-[78px]">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 border-2 border-red-400 dark:border-red-600 flex items-center justify-center text-xl">
                  🔨
                </div>
                <Text size="xs" weight="medium" className="leading-tight">
                  {t("step3Title")}
                </Text>
                <Span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white">
                  ● LIVE
                </Span>
              </div>
              <div className="shrink-0 self-start h-0.5 w-5 bg-slate-200 dark:bg-slate-600 mt-6" />
              {/* 4 Timer */}
              <div className="shrink-0 flex flex-col items-center text-center gap-1 w-[78px]">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 border-2 border-amber-300 dark:border-amber-600 flex items-center justify-center text-xl">
                  ⏰
                </div>
                <Text size="xs" weight="medium" className="leading-tight">
                  Timer Ends
                </Text>
                <Span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-600 text-white">
                  ENDED
                </Span>
              </div>
              <div className="shrink-0 self-start h-0.5 w-5 bg-slate-200 dark:bg-slate-600 mt-6" />
              {/* 5 Win */}
              <div className="shrink-0 flex flex-col items-center text-center gap-1 w-[78px]">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-400 dark:border-emerald-600 flex items-center justify-center text-xl">
                  🏆
                </div>
                <Text size="xs" weight="medium" className="leading-tight">
                  {t("step4Title")}
                </Text>
                <Span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                  WINNER!
                </Span>
              </div>
              <div className="shrink-0 self-start h-0.5 w-5 bg-slate-200 dark:bg-slate-600 mt-6" />
              {/* 6 Delivered */}
              <div className="shrink-0 flex flex-col items-center text-center gap-1 w-[78px]">
                <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900/40 border-2 border-sky-300 dark:border-sky-600 flex items-center justify-center text-xl">
                  📦
                </div>
                <Text size="xs" weight="medium" className="leading-tight">
                  {t("step6Title")}
                </Text>
                <Span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300">
                  DELIVERED
                </Span>
              </div>
            </div>

            {/* Outcome cards */}
            <div className="border-t border-dashed border-slate-200 dark:border-slate-700 pt-4 mt-2">
              <Text
                size="xs"
                variant="secondary"
                weight="medium"
                className="mb-3"
              >
                {t("diagramStatusNote")}
              </Text>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20 p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <Span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                      {t("diagramWinning")}
                    </Span>
                  </div>
                  <Text size="xs" variant="secondary">
                    {t("diagramWinningDesc")}
                  </Text>
                </div>
                <div className="rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20 p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                      ⚡ {t("diagramOutbid")}
                    </Span>
                  </div>
                  <Text size="xs" variant="secondary">
                    {t("diagramOutbidDesc")}
                  </Text>
                </div>
                <div className="rounded-xl border-2 border-rose-300 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-950/20 p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide">
                      ⚠️ {t("diagramForfeit")}
                    </Span>
                  </div>
                  <Text size="xs" variant="secondary">
                    {t("diagramForfeitDesc")}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <Heading level={2} className="mb-6">
          {t("stepsTitle")}
        </Heading>
        <div className="space-y-4 mb-14">
          {STEPS.map(({ number, icon, title, text }) => (
            <Section
              key={title}
              className={`flex gap-4 items-start ${themed.bgSecondary} rounded-xl p-6 border ${themed.border}`}
            >
              <div
                className={`shrink-0 w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 ${flex.center} text-sm font-bold text-indigo-600 dark:text-indigo-400`}
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

        {/* Good to Know */}
        <Heading level={2} className="mb-6">
          {t("knowMoreTitle")}
        </Heading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          {DETAILS.map(({ title, text }) => (
            <Section
              key={title}
              className={`${themed.bgSecondary} rounded-xl p-5 border ${themed.border}`}
            >
              <Heading level={3} className="font-semibold mb-2 text-base">
                {title}
              </Heading>
              <Text variant="secondary" size="sm" className="leading-relaxed">
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
          <div className="flex flex-wrap justify-center gap-3">
            <TextLink
              href={ROUTES.PUBLIC.AUCTIONS}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors text-sm"
            >
              {t("ctaBrowse")}
            </TextLink>
            <TextLink
              href={ROUTES.USER.RIPCOINS_PURCHASE}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 rounded-xl font-semibold hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors text-sm"
            >
              🪙 {t("buyRipcoins")}
            </TextLink>
          </div>
        </Section>

        <div
          className={`mt-10 pt-8 border-t ${themed.border} flex gap-6 text-sm`}
        >
          <TextLink
            href={ROUTES.PUBLIC.AUCTIONS}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {t("viewAuctions")}
          </TextLink>
          <TextLink
            href={ROUTES.PUBLIC.FAQS}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {t("faqLink")}
          </TextLink>
          <TextLink
            href={ROUTES.PUBLIC.RIPCOINS_INFO}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            🪙 {t("ripcoinsTitle")}
          </TextLink>
        </div>
      </div>
    </div>
  );
}
