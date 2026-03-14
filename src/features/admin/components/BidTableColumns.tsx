"use client";

/**
 * useBidTableColumns
 * Path: src/components/admin/bids/BidTableColumns.tsx
 *
 * Column definitions hook for the admin Bids/Auctions DataTable.
 */

import { THEME_CONSTANTS } from "@/constants";
import { Button, Caption, Span, Text } from "@/components";
import { formatCurrency, formatDate } from "@/utils";
import { useTranslations } from "next-intl";
import type { BidDocument } from "@/db/schema";

const BID_STATUS_STYLES: Record<string, string> = {
  active:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  outbid:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  won: "bg-primary/10 text-primary dark:bg-primary/20",
  lost: "bg-zinc-100 text-zinc-700 dark:bg-slate-800 dark:text-zinc-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export function useBidTableColumns(onView: (bid: BidDocument) => void) {
  const t = useTranslations("adminBids");
  const tActions = useTranslations("actions");
  const { themed } = THEME_CONSTANTS;

  return {
    columns: [
      {
        key: "productTitle",
        header: t("product"),
        sortable: true,
        width: "22%",
        render: (bid: BidDocument) => (
          <div>
            <Text size="sm" weight="medium" className="truncate max-w-[160px]">
              {bid.productTitle}
            </Text>
            <Caption className="font-mono">
              {bid.productId.slice(0, 10)}…
            </Caption>
          </div>
        ),
      },
      {
        key: "userName",
        header: t("bidder"),
        sortable: true,
        width: "20%",
        render: (bid: BidDocument) => (
          <div>
            <Text size="sm" weight="medium" className="truncate max-w-[150px]">
              {bid.userName}
            </Text>
            <Caption className="truncate max-w-[150px]">
              {bid.userEmail}
            </Caption>
          </div>
        ),
      },
      {
        key: "bidAmount",
        header: t("bidAmount"),
        sortable: true,
        width: "12%",
        render: (bid: BidDocument) => (
          <div>
            <Span className="font-semibold text-sm">
              {formatCurrency(bid.bidAmount)}
            </Span>
            {bid.isWinning && (
              <Span className="ml-1 text-xs text-primary font-medium">★</Span>
            )}
          </div>
        ),
      },
      {
        key: "bidDate",
        header: t("bidDate"),
        sortable: true,
        width: "14%",
        render: (bid: BidDocument) => (
          <Span className={`text-sm ${themed.textSecondary}`}>
            {formatDate(bid.bidDate)}
          </Span>
        ),
      },
      {
        key: "status",
        header: t("status"),
        sortable: true,
        width: "12%",
        render: (bid: BidDocument) => (
          <Span
            className={`px-2 py-1 text-xs font-medium rounded capitalize ${
              BID_STATUS_STYLES[bid.status] ??
              `${themed.bgSecondary} ${themed.textSecondary}`
            }`}
          >
            {bid.status}
          </Span>
        ),
      },
      {
        key: "actions",
        header: t("viewProduct"),
        width: "10%",
        render: (bid: BidDocument) => (
          <Button
            onClick={() => onView(bid)}
            className="text-primary hover:underline text-sm font-medium"
          >
            {tActions("view")}
          </Button>
        ),
      },
    ],
  };
}
