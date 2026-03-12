import type { Metadata } from "next";
import { ROUTES, THEME_CONSTANTS, SITE_CONFIG } from "@/constants";
import { Heading, Text, Section, TextLink, Span } from "@/components";
import { getTranslations } from "next-intl/server";

export const revalidate = 3600;

const { themed, flex, page } = THEME_CONSTANTS;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("shippingPolicy");
  return {
    title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
  };
}

export default async function ShippingPolicyPage() {
  const t = await getTranslations("shippingPolicy");

  const SECTIONS = [
    { title: t("orderProcessTitle"), text: t("orderProcessText") },
    { title: t("standardTitle"), text: t("standardText") },
    { title: t("expressTitle"), text: t("expressText") },
    { title: t("freeShippingTitle"), text: t("freeShippingText") },
    { title: t("auctionShippingTitle"), text: t("auctionShippingText") },
    { title: t("trackingTitle"), text: t("trackingText") },
    { title: t("internationalTitle"), text: t("internationalText") },
    { title: t("damagedTitle"), text: t("damagedText") },
  ];

  return (
    <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-6 sm:-mt-8 lg:-mt-10">
      {/* Header */}
      <Section className="bg-gradient-to-br from-sky-600 to-blue-900 text-white py-14 md:py-16 lg:py-20">
        <div className={`${page.container.sm}`}>
          <Heading level={1} className="mb-3 text-white">
            {t("title")}
          </Heading>
          <Text className="text-sky-200">{t("lastUpdated")}</Text>
        </div>
      </Section>

      <div className={`${page.container.sm} py-10 md:py-12 lg:py-16`}>
        <Text size="lg" variant="secondary" className="mb-8">
          {t("subtitle")}
        </Text>

        {/* ── Order Delivery Diagram ── */}
        <div
          className={`mb-10 rounded-2xl border ${themed.border} overflow-hidden`}
        >
          <div
            className={`${themed.bgSecondary} px-5 py-3 border-b ${themed.border}`}
          >
            <Text
              weight="semibold"
              size="sm"
              className="text-sky-700 dark:text-sky-300"
            >
              🚚 {t("diagramTitle")}
            </Text>
          </div>
          <div className={`${themed.bgPrimary} p-5`}>
            <div className="flex items-start overflow-x-auto pb-3 gap-1.5 scroll-smooth">
              {/* 1 Order Placed */}
              <div className="shrink-0 flex flex-col items-center text-center gap-1 w-[86px]">
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 border-2 border-indigo-300 dark:border-indigo-600 flex items-center justify-center text-xl">
                  ✅
                </div>
                <Span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                  {t("diagramStatus1")}
                </Span>
                <Text size="xs" variant="secondary" className="leading-tight">
                  {t("diagramStatus1Desc")}
                </Text>
              </div>
              <div className="shrink-0 self-start h-0.5 w-5 bg-sky-200 dark:bg-sky-800 mt-6" />
              {/* 2 Seller Preparing */}
              <div className="shrink-0 flex flex-col items-center text-center gap-1 w-[86px]">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 border-2 border-amber-300 dark:border-amber-600 flex items-center justify-center text-xl">
                  📦
                </div>
                <Span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                  {t("diagramStatus2")}
                </Span>
                <Text size="xs" variant="secondary" className="leading-tight">
                  {t("diagramStatus2Desc")}
                </Text>
              </div>
              <div className="shrink-0 self-start h-0.5 w-5 bg-sky-200 dark:bg-sky-800 mt-6" />
              {/* 3 Dispatched */}
              <div className="shrink-0 flex flex-col items-center text-center gap-1 w-[86px]">
                <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900/40 border-2 border-sky-300 dark:border-sky-600 flex items-center justify-center text-xl">
                  🚀
                </div>
                <Span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300">
                  {t("diagramStatus3")}
                </Span>
                <Text size="xs" variant="secondary" className="leading-tight">
                  {t("diagramStatus3Desc")}
                </Text>
              </div>
              <div className="shrink-0 self-start h-0.5 w-5 bg-sky-200 dark:bg-sky-800 mt-6" />
              {/* 4 In Transit */}
              <div className="shrink-0 flex flex-col items-center text-center gap-1 w-[86px]">
                <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/40 border-2 border-violet-300 dark:border-violet-600 flex items-center justify-center text-xl">
                  🚚
                </div>
                <Span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
                  {t("diagramStatus4")}
                </Span>
                <Text size="xs" variant="secondary" className="leading-tight">
                  {t("diagramStatus4Desc")}
                </Text>
              </div>
              <div className="shrink-0 self-start h-0.5 w-5 bg-sky-200 dark:bg-sky-800 mt-6" />
              {/* 5 Delivered */}
              <div className="shrink-0 flex flex-col items-center text-center gap-1 w-[86px]">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-400 dark:border-emerald-600 flex items-center justify-center text-xl">
                  🏠
                </div>
                <Span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                  {t("diagramStatus5")}
                </Span>
                <Text size="xs" variant="secondary" className="leading-tight">
                  {t("diagramStatus5Desc")}
                </Text>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700">
              <Text size="xs" variant="secondary">
                📌 {t("diagramNote")}
              </Text>
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
            href={ROUTES.PUBLIC.TRACK_ORDER}
            className="text-sky-600 dark:text-sky-400 hover:underline"
          >
            {t("trackOrder")}
          </TextLink>
          <TextLink
            href={ROUTES.PUBLIC.HELP}
            className="text-sky-600 dark:text-sky-400 hover:underline"
          >
            {t("helpCenter")}
          </TextLink>
          <TextLink
            href={ROUTES.PUBLIC.CONTACT}
            className="text-sky-600 dark:text-sky-400 hover:underline"
          >
            {t("contactUs")}
          </TextLink>
          <TextLink
            href={ROUTES.PUBLIC.REFUND_POLICY}
            className="text-sky-600 dark:text-sky-400 hover:underline"
          >
            Refund Policy
          </TextLink>
        </div>
      </div>
    </div>
  );
}
