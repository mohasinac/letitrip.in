"use client";

/**
 * RipCoinsWallet
 *
 * Displays the user's RipCoin balance (available, engaged, total),
 * transaction history with tabs (All / Purchases), and per-row actions:
 *   - purchase  → Refund button (or "Not enough available")
 *   - engage    → View Listing button
 *   - release   → shown as + credit, no action
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Card,
  Heading,
  Text,
  Caption,
  Button,
  Badge,
  Skeleton,
  DataTable,
  TablePagination,
  Spinner,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { formatDate } from "@/utils";
import {
  useRipCoinBalance,
  useRipCoinHistory,
  useRefundRipCoinPurchase,
  useUrlTable,
} from "@/hooks";
import { useRouter } from "@/i18n/navigation";

const { spacing, flex } = THEME_CONSTANTS;

type TxType =
  | "purchase"
  | "engage"
  | "release"
  | "forfeit"
  | "return"
  | "refund"
  | "admin_grant"
  | "admin_deduct";

const TX_VARIANT: Record<
  TxType,
  "success" | "warning" | "danger" | "info" | "default"
> = {
  purchase: "success",
  engage: "warning",
  release: "info",
  forfeit: "danger",
  return: "success",
  refund: "info",
  admin_grant: "success",
  admin_deduct: "danger",
};

interface TxRow {
  id: string;
  type: TxType;
  coins: number;
  createdAt: string | { _seconds: number };
  description?: string;
  notes?: string;
  productId?: string;
  productTitle?: string;
  refunded?: boolean;
}

type HistoryTab = "all" | "purchases";

export function RipCoinsWallet() {
  const t = useTranslations("ripcoinsWallet");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<HistoryTab>("all");
  const [refundingId, setRefundingId] = useState<string | null>(null);

  const table = useUrlTable({
    defaults: { pageSize: "20", sorts: "-createdAt" },
  });
  const page = table.getNumber("page", 1);
  const pageSize = table.getNumber("pageSize", 20);

  const {
    data: balanceData,
    isLoading: balanceLoading,
    refetch: refetchBalance,
  } = useRipCoinBalance();

  const historyParams =
    activeTab === "purchases"
      ? `${table.params.toString()}&filters=type==purchase`
      : table.params.toString();

  const {
    data: historyData,
    isLoading: historyLoading,
    refetch: refetchHistory,
  } = useRipCoinHistory(historyParams);

  const { mutate: refundPurchase } = useRefundRipCoinPurchase();

  const available = balanceData?.ripcoinBalance ?? 0;
  const engaged = balanceData?.engagedRipcoins ?? 0;
  const freeCoins = available - engaged;

  const historyTotal: number = (historyData as { total?: number })?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(historyTotal / pageSize));

  const handleRefund = async (txId: string) => {
    setRefundingId(txId);
    try {
      await refundPurchase(txId);
      void refetchBalance();
      void refetchHistory();
    } finally {
      setRefundingId(null);
    }
  };

  const columns = [
    {
      key: "type",
      header: t("history.type"),
      render: (row: TxRow) => (
        <div className="flex flex-col gap-1">
          <Badge variant={TX_VARIANT[row.type] ?? "default"}>
            {t(`txType.${row.type}` as Parameters<typeof t>[0])}
          </Badge>
          {row.type === "purchase" && row.refunded && (
            <Caption className="text-xs text-gray-400">{t("refunded")}</Caption>
          )}
        </div>
      ),
    },
    {
      key: "coins",
      header: t("history.coins"),
      render: (row: TxRow) => {
        const isCredit =
          row.type === "purchase" ||
          row.type === "release" ||
          row.type === "return" ||
          row.type === "admin_grant";
        return (
          <Text weight="semibold" variant={isCredit ? "success" : "error"}>
            {isCredit ? "+" : "-"}
            {Math.abs(row.coins).toLocaleString()} RC
          </Text>
        );
      },
    },
    {
      key: "description",
      header: t("history.description"),
      render: (row: TxRow) => (
        <Caption>
          {row.notes ?? row.description ?? row.productTitle ?? "—"}
        </Caption>
      ),
    },
    {
      key: "createdAt",
      header: t("history.date"),
      render: (row: TxRow) => {
        const raw = row.createdAt;
        const date =
          typeof raw === "object" && "_seconds" in raw
            ? new Date(raw._seconds * 1000)
            : new Date(raw as string);
        return <Caption>{formatDate(date)}</Caption>;
      },
    },
    {
      key: "actions",
      header: "",
      render: (row: TxRow) => {
        if (row.type === "engage" && row.productId) {
          return (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                router.push(
                  ROUTES.PUBLIC.PRODUCT_DETAIL(row.productId!) as never,
                )
              }
            >
              {t("history.viewListing")}
            </Button>
          );
        }

        if (row.type === "purchase" && !row.refunded) {
          if (freeCoins < row.coins) {
            return (
              <Caption className="text-xs text-amber-600 dark:text-amber-400 whitespace-nowrap">
                {t("history.notEnoughToRefund")}
              </Caption>
            );
          }
          return (
            <Button
              variant="danger"
              size="sm"
              isLoading={refundingId === row.id}
              disabled={refundingId !== null}
              onClick={() => handleRefund(row.id)}
            >
              {t("history.refund")}
            </Button>
          );
        }

        return null;
      },
    },
  ];

  const tabItems = [
    { id: "all" as HistoryTab, label: t("tabs.all") },
    { id: "purchases" as HistoryTab, label: t("tabs.purchases") },
  ];

  return (
    <div className={spacing.stack}>
      {/* ── Balance stat cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className={`${spacing.padding.md} flex flex-col gap-2`}>
          <Caption>{t("available")}</Caption>
          {balanceLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <Heading level={2} className="text-indigo-600 dark:text-indigo-400">
              {available.toLocaleString()} RC
            </Heading>
          )}
          <Caption className="text-xs">
            ≈ ₹{(available / 10).toFixed(2)}
          </Caption>
        </Card>

        <Card className={`${spacing.padding.md} flex flex-col gap-2`}>
          <Caption>{t("engaged")}</Caption>
          {balanceLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <Heading level={2} className="text-amber-600 dark:text-amber-400">
              {engaged.toLocaleString()} RC
            </Heading>
          )}
          <Caption className="text-xs">{t("engagedNote")}</Caption>
        </Card>

        <Card className={`${spacing.padding.md} flex flex-col gap-2`}>
          <Caption>{t("total")}</Caption>
          {balanceLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <Heading
              level={2}
              className="text-emerald-600 dark:text-emerald-400"
            >
              {(available + engaged).toLocaleString()} RC
            </Heading>
          )}
          <Caption className="text-xs">{t("totalNote")}</Caption>
        </Card>
      </div>

      {/* ── Buy CTA ─────────────────────────────────────────────────── */}
      <Card className={`${spacing.padding.md} ${flex.between} flex-wrap gap-3`}>
        <div>
          <Text weight="semibold">{t("buyTitle")}</Text>
          <Text size="sm" variant="secondary" className="mt-0.5">
            {t("buyNote")}
          </Text>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => router.push(ROUTES.USER.RIPCOINS_PURCHASE as never)}
        >
          {t("buyButton")}
        </Button>
      </Card>

      {/* ── Transaction history ──────────────────────────────────────── */}
      <Card className={spacing.padding.md}>
        <div className={`${flex.between} flex-wrap gap-2 mb-4`}>
          <Heading level={3}>{t("history.title")}</Heading>
          <Tabs
            value={activeTab}
            onChange={(v) => {
              setActiveTab(v as HistoryTab);
              table.setPage(1);
            }}
            variant="line"
          >
            <TabsList>
              {tabItems.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {historyLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <DataTable<TxRow>
            columns={columns}
            data={(historyData as { items?: TxRow[] })?.items ?? []}
            keyExtractor={(row) => row.id}
            loading={false}
            emptyTitle={t("history.empty")}
            externalPagination
          />
        )}

        {historyTotal > 0 && (
          <TablePagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            total={historyTotal}
            onPageChange={(p) => table.setPage(p)}
            onPageSizeChange={(n) => table.set("pageSize", String(n))}
          />
        )}
      </Card>
    </div>
  );
}
