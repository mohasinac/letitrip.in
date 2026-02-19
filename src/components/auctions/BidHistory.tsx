"use client";

import { UI_LABELS, THEME_CONSTANTS } from "@/constants";
import { formatCurrency, formatRelativeTime } from "@/utils";
import type { BidDocument } from "@/db/schema";

const { themed, spacing } = THEME_CONSTANTS;

interface BidHistoryProps {
  bids: BidDocument[];
  loading?: boolean;
}

export function BidHistory({ bids, loading = false }: BidHistoryProps) {
  if (loading) {
    return (
      <div
        className={`rounded-xl border ${themed.border} p-4 ${spacing.stack}`}
      >
        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex justify-between items-center py-2">
            <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`rounded-xl border ${themed.border} overflow-hidden`}>
      {/* Header */}
      <div
        className={`px-4 py-3 border-b ${themed.border} ${themed.bgSecondary}`}
      >
        <h3 className={`font-semibold ${themed.textPrimary}`}>
          {UI_LABELS.AUCTIONS_PAGE.BID_HISTORY_TITLE}
        </h3>
        {bids.length > 0 && (
          <p className={`text-xs ${themed.textSecondary}`}>
            {UI_LABELS.AUCTIONS_PAGE.BID_COUNT(bids.length)}
          </p>
        )}
      </div>

      {/* Bid list */}
      {bids.length === 0 ? (
        <div className={`py-10 text-center ${themed.textSecondary} text-sm`}>
          {UI_LABELS.AUCTIONS_PAGE.BID_HISTORY_EMPTY}
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {bids.map((bid, index) => (
            <li
              key={bid.id}
              className={`flex items-center justify-between px-4 py-3 ${
                index === 0 ? "bg-indigo-50 dark:bg-indigo-950/30" : ""
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex flex-col min-w-0">
                  <span
                    className={`text-sm font-medium ${themed.textPrimary} truncate`}
                  >
                    {anonymizeName(bid.userName)}
                  </span>
                  <span className={`text-xs ${themed.textSecondary}`}>
                    {formatRelativeTime(bid.bidDate || bid.createdAt)}
                  </span>
                </div>
                {index === 0 && (
                  <span className="shrink-0 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-semibold px-2 py-0.5 rounded-full">
                    {UI_LABELS.AUCTIONS_PAGE.WINNING_BID}
                  </span>
                )}
              </div>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0 ml-2">
                {formatCurrency(bid.bidAmount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Anonymize bidder name to protect privacy: "John Smith" → "John S." */
function anonymizeName(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length <= 1) return parts[0] ?? "Bidder";
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}
