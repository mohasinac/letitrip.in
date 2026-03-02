"use client";

/**
 * RipCoinsWallet
 *
 * Displays the user's RipCoin balance, engaged coins, and purchase history.
 * Provides a "Buy RipCoins" entry point that opens the BuyRipCoinsModal.
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
} from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { formatDate } from "@/utils";
import { useRipCoinBalance, useRipCoinHistory, useUrlTable } from "@/hooks";
import { BuyRipCoinsModal } from "./BuyRipCoinsModal";

const { spacing } = THEME_CONSTANTS;

type TxType =
  | "purchase"
  | "engage"
  | "release"
  | "forfeit"
  | "return"
  | "refund"
  | "admin_credit"
  | "admin_debit";

const TX_LABELS: Record<TxType, string> = {
  purchase: "Purchase",
  engage: "Bid Engaged",
  release: "Bid Released",
  forfeit: "Forfeited",
  return: "Returned",
  refund: "Refund",
  admin_credit: "Admin Credit",
  admin_debit: "Admin Debit",
};

const TX_VARIANT: Record<
  TxType,
  "success" | "warning" | "danger" | "info" | "default"
> = {
  purchase: "success",
  engage: "warning",
  release: "info",
  forfeit: "danger",
  return: "success",
  refund: "success",
  admin_credit: "success",
  admin_debit: "danger",
};

interface TxRow {
  id: string;
  type: TxType;
  coins: number;
  createdAt: string | { _seconds: number };
  description?: string;
}

export function RipCoinsWallet() {
  const t = useTranslations("ripcoinsWallet");
  const [buyOpen, setBuyOpen] = useState(false);
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
  const {
    data: historyData,
    isLoading: historyLoading,
    refetch: refetchHistory,
  } = useRipCoinHistory(table.params.toString());

  const available =
    (balanceData?.ripcoinBalance ?? 0) - (balanceData?.engagedRipcoins ?? 0);
  const engaged = balanceData?.engagedRipcoins ?? 0;
  const total: number = (historyData as { total?: number })?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const columns = [
    {
      key: "type",
      header: t("history.type"),
      render: (row: TxRow) => (
        <Badge variant={TX_VARIANT[row.type] ?? "default"}>
          {TX_LABELS[row.type] ?? row.type}
        </Badge>
      ),
    },
    {
      key: "coins",
      header: t("history.coins"),
      render: (row: TxRow) => (
        <Text weight="semibold" variant={row.coins >= 0 ? "success" : "error"}>
          {row.coins >= 0 ? "+" : ""}
          {row.coins} RC
        </Text>
      ),
    },
    {
      key: "description",
      header: t("history.description"),
      render: (row: TxRow) => <Caption>{row.description ?? "â€”"}</Caption>,
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
  ];

  return (
    <div className={`${spacing.stack}`}>
      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Available */}
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
            â‰ˆ â‚¹{(available / 10).toFixed(2)}
          </Caption>
        </Card>

        {/* Engaged */}
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

        {/* Buy CTA */}
        <Card
          className={`${spacing.padding.md} flex flex-col gap-3 justify-between`}
        >
          <div>
            <Caption>{t("buyTitle")}</Caption>
            <Text size="sm" variant="secondary" className="mt-1">
              {t("buyNote")}
            </Text>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setBuyOpen(true)}
            className="w-full sm:w-auto"
          >
            {t("buyButton")}
          </Button>
        </Card>
      </div>

      {/* Transaction history */}
      <Card className={spacing.padding.md}>
        <Heading level={3} className="mb-4">
          {t("history.title")}
        </Heading>

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

        {total > 0 && (
          <TablePagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            total={total}
            onPageChange={(p) => table.setPage(p)}
            onPageSizeChange={(n) => table.set("pageSize", String(n))}
          />
        )}
      </Card>

      <BuyRipCoinsModal
        open={buyOpen}
        onClose={() => setBuyOpen(false)}
        onPurchaseSuccess={() => {
          void refetchBalance();
          void refetchHistory();
        }}
      />
    </div>
  );
}
