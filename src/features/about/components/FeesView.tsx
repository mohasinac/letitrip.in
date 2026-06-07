import { THEME_CONSTANTS } from "@/constants";
import { Heading, Text, Section, Caption, Div, Table, Thead, Tbody, Tr, Th, Td } from "@mohasinac/appkit/ui";
import { getTranslations } from "next-intl/server";


const __O = {
  xAuto: "overflow-x-auto",
} as const;
const { themed, page } = THEME_CONSTANTS;
const CLS_RATE_CELL = "py-3 px-4 font-semibold text-violet-700 dark:text-violet-400";
const CLS_HIGHLIGHT = "font-bold text-emerald-700 dark:text-emerald-400";

// ─── Sub-renderers ────────────────────────────────────────────────────────────

type FeeRow = { category: string; rate: string; who: string; note: string };
type PayoutRow = { label: string; example: string; highlight?: boolean };
type T = Awaited<ReturnType<typeof getTranslations<"fees">>>;

function renderFeeTable(feeRows: FeeRow[], t: T) {
  return (
    <Section>
      <Heading level={2} className="mb-6">{t("tableTitle")}</Heading>
      <Div className={`${__O.xAuto} rounded-xl border ${themed.border}`}>
        <Table className="w-full text-sm">
          <Thead className={themed.bgSecondary}>
            <Tr>
              <Th className="py-3 px-4 text-left font-semibold">{t("colFeeType")}</Th>
              <Th className="py-3 px-4 text-left font-semibold">{t("colRate")}</Th>
              <Th className="py-3 px-4 text-left font-semibold">{t("colPaidBy")}</Th>
              <Th className="py-3 px-4 text-left font-semibold hidden md:table-cell">{t("colNote")}</Th>
            </Tr>
          </Thead>
          <Tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {feeRows.map((row) => (
              <Tr key={row.category} className={`${themed.bgPrimary} hover:bg-neutral-50 dark:hover:bg-neutral-800/50`}>
                <Td className="py-3 px-4 font-medium">{row.category}</Td>
                <Td className={CLS_RATE_CELL}>{row.rate}</Td>
                <Td className="py-3 px-4"><Caption>{row.who}</Caption></Td>
                <Td className="py-3 px-4 text-neutral-500 dark:text-neutral-400 hidden md:table-cell text-xs">{row.note}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Div>
      <Caption className="mt-3 block text-neutral-500">{t("tableNote")}</Caption>
    </Section>
  );
}

function renderPayoutExample(payoutRows: PayoutRow[], t: T) {
  return (
    <Section>
      <Heading level={2} className="mb-3">{t("payoutExampleTitle")}</Heading>
      <Text variant="secondary" className="mb-6">{t("payoutExampleSubtitle")}</Text>
      <Div className={`rounded-xl border ${themed.border} ${themed.bgPrimary} p-5 max-w-sm`}>
        <Heading level={3} className="text-base mb-4">{t("payoutExampleProduct")}</Heading>
        <Div className="space-y-2">
          {payoutRows.map((row, i) => (
            <Div key={i} className={`flex justify-between text-sm ${row.highlight ? "border-t border-neutral-200 dark:border-neutral-700 pt-2 mt-2 font-bold" : ""}`}>
              <Text className={row.highlight ? "font-bold" : "text-neutral-600 dark:text-neutral-400"}>{row.label}</Text>
              <Text className={row.highlight ? CLS_HIGHLIGHT : ""}>{row.example}</Text>
            </Div>
          ))}
        </Div>
      </Div>
    </Section>
  );
}

function renderFeesDisclaimer(t: T) {
  return (
    <Section className={`rounded-xl border ${themed.border} p-5 ${themed.bgSecondary}`}>
      <Heading level={3} className="text-base mb-2">{t("disclaimerTitle")}</Heading>
      <Caption className="leading-relaxed">{t("disclaimerText")}</Caption>
    </Section>
  );
}

export async function FeesView() {
  const t = await getTranslations("fees");

  const FEE_ROWS = [
    {
      category: t("platformFeeTitle"),
      rate: t("platformFeeRate"),
      who: t("paidBySeller"),
      note: t("platformFeeNote"),
    },
    {
      category: t("gatewayFeeTitle"),
      rate: t("gatewayFeeRate"),
      who: t("paidBySeller"),
      note: t("gatewayFeeNote"),
    },
    {
      category: t("gstTitle"),
      rate: t("gstRate"),
      who: t("paidBySeller"),
      note: t("gstNote"),
    },
    {
      category: t("buyerFeeTitle"),
      rate: t("buyerFeeRate"),
      who: t("paidByBuyer"),
      note: t("buyerFeeNote"),
    },
    {
      category: t("offerFeeTitle"),
      rate: t("offerFeeRate"),
      who: t("paidByBuyer"),
      note: t("offerFeeNote"),
    },
    {
      category: t("shippingFeeTitle"),
      rate: t("shippingFeeRate"),
      who: t("paidByBuyer"),
      note: t("shippingFeeNote"),
    },
  ];

  const OFFER_PAYOUT_ROWS = [
    { label: t("grossSale"), example: "₹1,000" },
    { label: `${t("platformFeeTitle")} (5%)`, example: "− ₹50" },
    { label: `${t("gatewayFeeTitle")} (2.36%)`, example: "− ₹23.60" },
    { label: `${t("gstTitle")} on platform fee (18%)`, example: "− ₹9" },
    { label: t("netPayoutLabel"), example: "= ₹917.40", highlight: true },
  ];

  return (
    <Div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-6 sm:-mt-8 lg:-mt-10">
      {/* Hero */}
      <Section
        className={`${THEME_CONSTANTS.accentBanner.pageHero} text-white py-14 md:py-16 lg:py-20`}
      >
        <Div className={`${page.container.sm} text-center`}>
          <Heading level={1} variant="none" className="mb-4 text-white">
            {t("title")}
          </Heading>
          <Text variant="none" className="text-white/80 max-w-2xl mx-auto">
            {t("subtitle")}
          </Text>
        </Div>
      </Section>

      <Div className={`${page.container.sm} py-10 md:py-12 lg:py-16 space-y-12`}>
        {renderFeeTable(FEE_ROWS, t)}
        {renderPayoutExample(OFFER_PAYOUT_ROWS, t)}
        {renderFeesDisclaimer(t)}
      </Div>
    </Div>
  );
}

