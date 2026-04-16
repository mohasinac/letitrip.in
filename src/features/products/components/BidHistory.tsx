"use client";
import { UI_LABELS } from "@/constants/ui";
import { THEME_CONSTANTS } from "@/constants/theme";
import { formatCurrency, formatRelativeTime } from "@mohasinac/appkit/utils";


import type { PublicBid } from "@mohasinac/appkit/features/auctions";
import { Heading, Li, Span, Text, Ul, Row } from "@mohasinac/appkit/ui";

const { themed, spacing, flex } = THEME_CONSTANTS;

interface BidHistoryProps {
  bids: PublicBid[];
  loading?: boolean;
  /** When provided, bids matching this userId show the full name instead of anonymised. */
  currentUserId?: string | null;
}

export function BidHistory({
  bids,
  loading = false,
  currentUserId,
}: BidHistoryProps) {
  if (loading) {
    return (
      <div
        className={`rounded-xl border ${themed.border} p-4 ${spacing.stack}`}
      >
        <div className="h-5 w-32 bg-zinc-200 dark:bg-slate-700 rounded animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex justify-between items-center py-2">
            <div className="h-4 w-1/3 bg-zinc-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-1/4 bg-zinc-200 dark:bg-slate-700 rounded animate-pulse" />
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
        <Heading level={3} className="font-semibold">
          {UI_LABELS.AUCTIONS_PAGE.BID_HISTORY_TITLE}
        </Heading>
        {bids.length > 0 && (
          <Text size="xs" variant="secondary">
            {UI_LABELS.AUCTIONS_PAGE.BID_COUNT(bids.length)}
          </Text>
        )}
      </div>

      {/* Bid list */}
      {bids.length === 0 ? (
        <div className={`py-10 text-center ${themed.textSecondary} text-sm`}>
          {UI_LABELS.AUCTIONS_PAGE.BID_HISTORY_EMPTY}
        </div>
      ) : (
        <Ul className="divide-y divide-zinc-100 dark:divide-slate-800">
          {bids.map((bid, index) => (
            <Li
              key={bid.id}
              className={`${flex.between} px-4 py-3 ${
                index === 0 ? "bg-primary/5 dark:bg-primary/10" : ""
              }`}
            >
              <Row gap="sm" className="min-w-0">
                <div className="flex flex-col min-w-0">
                  <Span
                    className={`text-sm font-medium ${themed.textPrimary} truncate`}
                  >
                    {currentUserId && bid.userId === currentUserId
                      ? bid.userName
                      : anonymizeName(bid.userName)}
                  </Span>
                  <Span className={`text-xs ${themed.textSecondary}`}>
                    {formatRelativeTime(bid.bidDate)}
                  </Span>
                </div>
                {index === 0 && (
                  <Span className="shrink-0 text-xs bg-primary/10 dark:bg-primary/20 text-primary font-semibold px-2 py-0.5 rounded-full">
                    {UI_LABELS.AUCTIONS_PAGE.WINNING_BID}
                  </Span>
                )}
              </Row>
              <Span className="font-bold text-primary shrink-0 ml-2">
                {formatCurrency(bid.bidAmount)}
              </Span>
            </Li>
          ))}
        </Ul>
      )}
    </div>
  );
}

/** Anonymize bidder name to protect privacy: "John Smith" ? "John S." */
function anonymizeName(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length <= 1) return parts[0] ?? "Bidder";
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

