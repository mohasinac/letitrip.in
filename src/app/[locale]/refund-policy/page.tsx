import type { Metadata } from "next";
import { ROUTES, THEME_CONSTANTS, SITE_CONFIG } from "@/constants";
import { Heading, Text, Section, TextLink, Span } from "@/components";
import { getTranslations } from "next-intl/server";

export const revalidate = 3600;

const { themed, flex, page } = THEME_CONSTANTS;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("refundPolicy");
  return {
    title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
  };
}

export default async function RefundPolicyPage() {
  const t = await getTranslations("refundPolicy");

  const SECTIONS = [
    { title: t("eligibilityTitle"), text: t("eligibilityText") },
    { title: t("processTitle"), text: t("processText") },
    { title: t("timelineTitle"), text: t("timelineText") },
    { title: t("auctionsTitle"), text: t("auctionsText") },
    { title: t("exchangesTitle"), text: t("exchangesText") },
    { title: t("shippingTitle"), text: t("shippingText") },
    { title: t("nonRefundableTitle"), text: t("nonRefundableText") },
  ];

  return (
    <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-6 sm:-mt-8 lg:-mt-10">
      {/* Header */}
      <Section className="bg-gradient-to-br from-emerald-700 to-teal-900 text-white py-14 md:py-16 lg:py-20">
        <div className={`${page.container.sm}`}>
          <Heading level={1} className="mb-3 text-white">
            {t("title")}
          </Heading>
          <Text className="text-emerald-200">{t("lastUpdated")}</Text>
        </div>
      </Section>

      <div className={`${page.container.sm} py-10 md:py-12 lg:py-16`}>
        <Text size="lg" variant="secondary" className="mb-8">
          {t("subtitle")}
        </Text>

        {/* ── Refund Request Flow Diagram ── */}
        <div
          className={`mb-10 rounded-2xl border ${themed.border} overflow-hidden`}
        >
          <div
            className={`${themed.bgSecondary} px-5 py-3 border-b ${themed.border}`}
          >
            <Text
              weight="semibold"
              size="sm"
              className="text-emerald-700 dark:text-emerald-300"
            >
              💸 {t("diagramTitle")}
            </Text>
          </div>
          <div className={`${themed.bgPrimary} p-5`}>
            <div className="flex items-start overflow-x-auto pb-3 gap-1.5 scroll-smooth">
              {/* 1 My Orders */}
              <div className="shrink-0 flex flex-col items-center text-center gap-1 w-[86px]">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center text-xl">
                  📋
                </div>
                <Span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {t("diagramS1")}
                </Span>
                <Text size="xs" variant="secondary" className="leading-tight">
                  {t("diagramS1Desc")}
                </Text>
              </div>
              <div className="shrink-0 self-start h-0.5 w-5 bg-emerald-200 dark:bg-emerald-800 mt-6" />
              {/* 2 Request Refund */}
              <div className="shrink-0 flex flex-col items-center text-center gap-1 w-[86px]">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 border-2 border-amber-300 dark:border-amber-600 flex items-center justify-center text-xl">
                  ✋
                </div>
                <Span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                  {t("diagramS2")}
                </Span>
                <Text size="xs" variant="secondary" className="leading-tight">
                  {t("diagramS2Desc")}
                </Text>
              </div>
              <div className="shrink-0 self-start h-0.5 w-5 bg-emerald-200 dark:bg-emerald-800 mt-6" />
              {/* 3 Under Review */}
              <div className="shrink-0 flex flex-col items-center text-center gap-1 w-[86px]">
                <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900/40 border-2 border-sky-300 dark:border-sky-600 flex items-center justify-center text-xl">
                  🔍
                </div>
                <Span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300">
                  {t("diagramS3")}
                </Span>
                <Text size="xs" variant="secondary" className="leading-tight">
                  {t("diagramS3Desc")}
                </Text>
              </div>
              <div className="shrink-0 self-start h-0.5 w-5 bg-emerald-200 dark:bg-emerald-800 mt-6" />
              {/* 4 Approved */}
              <div className="shrink-0 flex flex-col items-center text-center gap-1 w-[86px]">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-400 dark:border-emerald-600 flex items-center justify-center text-xl">
                  ✅
                </div>
                <Span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                  {t("diagramS4")}
                </Span>
                <Text size="xs" variant="secondary" className="leading-tight">
                  {t("diagramS4Desc")}
                </Text>
              </div>
              <div className="shrink-0 self-start h-0.5 w-5 bg-emerald-200 dark:bg-emerald-800 mt-6" />
              {/* 5 Money Returned */}
              <div className="shrink-0 flex flex-col items-center text-center gap-1 w-[86px]">
                <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/40 border-2 border-violet-400 dark:border-violet-600 flex items-center justify-center text-xl">
                  💚
                </div>
                <Span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
                  {t("diagramS5")}
                </Span>
                <Text size="xs" variant="secondary" className="leading-tight">
                  {t("diagramS5Desc")}
                </Text>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {SECTIONS.map(({ title, text }) => (
            <Section key={title}>
              <Heading level={2} className="mb-3">
                {title}
              </Heading>
              <Text variant="secondary" className="leading-relaxed">
                {text}
              </Text>
            </Section>
          ))}

          {/* Contact */}
          <Section
            className={`${themed.bgSecondary} rounded-xl p-6 border ${themed.border}`}
          >
            <Heading level={2} className="mb-2">
              {t("contactTitle")}
            </Heading>
            <Text variant="secondary">{t("contactText")}</Text>
          </Section>
        </div>

        <div
          className={`mt-12 pt-8 border-t ${themed.border} flex gap-6 text-sm`}
        >
          <TextLink
            href={ROUTES.PUBLIC.HELP}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {t("helpCenter")}
          </TextLink>
          <TextLink
            href={ROUTES.PUBLIC.CONTACT}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {t("contactUs")}
          </TextLink>
          <TextLink
            href={ROUTES.PUBLIC.SHIPPING_POLICY}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Shipping Policy
          </TextLink>
        </div>
      </div>
    </div>
  );
}
