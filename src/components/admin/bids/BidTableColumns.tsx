/**
 * BidTableColumns
 * Path: src/components/admin/bids/BidTableColumns.tsx
 *
 * Column definitions for the admin Bids/Auctions DataTable.
 */

import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import { formatCurrency, formatDate } from "@/utils";
import type { BidDocument } from "@/db/schema";

const LABELS = UI_LABELS.ADMIN.BIDS;
const { themed } = THEME_CONSTANTS;

const BID_STATUS_STYLES: Record<string, string> = {
  active:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  outbid:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  won: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  lost: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export function getBidTableColumns(onView: (bid: BidDocument) => void) {
  return {
    columns: [
      {
        key: "productTitle",
        header: LABELS.PRODUCT,
        sortable: true,
        width: "22%",
        render: (bid: BidDocument) => (
          <div>
            <p className="font-medium truncate max-w-[160px] text-sm">
              {bid.productTitle}
            </p>
            <p className={`text-xs ${themed.textSecondary} font-mono`}>
              {bid.productId.slice(0, 10)}…
            </p>
          </div>
        ),
      },
      {
        key: "userName",
        header: LABELS.BIDDER,
        sortable: true,
        width: "20%",
        render: (bid: BidDocument) => (
          <div>
            <p className="text-sm font-medium truncate max-w-[150px]">
              {bid.userName}
            </p>
            <p
              className={`text-xs ${themed.textSecondary} truncate max-w-[150px]`}
            >
              {bid.userEmail}
            </p>
          </div>
        ),
      },
      {
        key: "bidAmount",
        header: LABELS.BID_AMOUNT,
        sortable: true,
        width: "12%",
        render: (bid: BidDocument) => (
          <div>
            <span className="font-semibold text-sm">
              {formatCurrency(bid.bidAmount)}
            </span>
            {bid.isWinning && (
              <span className="ml-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                ★
              </span>
            )}
          </div>
        ),
      },
      {
        key: "bidDate",
        header: LABELS.BID_DATE,
        sortable: true,
        width: "14%",
        render: (bid: BidDocument) => (
          <span className={`text-sm ${themed.textSecondary}`}>
            {formatDate(bid.bidDate)}
          </span>
        ),
      },
      {
        key: "status",
        header: LABELS.STATUS,
        sortable: true,
        width: "12%",
        render: (bid: BidDocument) => (
          <span
            className={`px-2 py-1 text-xs font-medium rounded capitalize ${
              BID_STATUS_STYLES[bid.status] ??
              `${themed.bgSecondary} ${themed.textSecondary}`
            }`}
          >
            {bid.status}
          </span>
        ),
      },
      {
        key: "actions",
        header: LABELS.VIEW_PRODUCT,
        width: "10%",
        render: (bid: BidDocument) => (
          <button
            onClick={() => onView(bid)}
            className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium"
          >
            {UI_LABELS.ACTIONS.VIEW}
          </button>
        ),
      },
    ],
  };
}
