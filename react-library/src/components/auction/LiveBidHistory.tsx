
import { useEffect, useState, type ReactNode } from "react";

/**
 * Bid data structure
 */
export interface BidData {
  /** Unique bid ID */
  id: string;
  /** User ID who placed the bid */
  user_id: string;
  /** Bid amount */
  amount: number;
  /** Timestamp when bid was placed */
  created_at: string;
  /** Whether this is the winning/leading bid */
  is_winning: boolean;
}

export interface LiveBidHistoryProps {
  /** Auction ID */
  auctionId: string;
  /** Array of bids to display */
  bids: BidData[];
  /** Current highest bid amount */
  currentBid: number;
  /**
   * Function to format price/currency
   * @default (amount) => `₹${amount.toLocaleString("en-IN")}`
   */
  formatPrice?: (amount: number) => string;
  /**
   * Function to format relative time
   * @default (date) => new Date(date).toLocaleString()
   */
  formatRelativeTime?: (date: string) => string;
  /**
   * Function to mask user IDs for privacy
   * @default (userId) => `${userId[0]}***${userId.slice(-2)}`
   */
  maskUserId?: (userId: string) => string;
  /**
   * Custom icons (optional)
   */
  icons?: {
    emptyState?: ReactNode;
    user?: ReactNode;
    clock?: ReactNode;
  };
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Default price formatter
 */
const defaultFormatPrice = (amount: number): string => {
  return `₹${amount.toLocaleString("en-IN")}`;
};

/**
 * Default relative time formatter
 */
const defaultFormatRelativeTime = (date: string): string => {
  try {
    return new Date(date).toLocaleString();
  } catch {
    return date;
  }
};

/**
 * Default user ID masker
 */
const defaultMaskUserId = (userId: string): string => {
  if (userId.length <= 4) return userId;
  const start = userId.substring(0, 1);
  const end = userId.substring(userId.length - 2);
  return `${start}***${end}`;
};

/**
 * Default TrendingUp Icon (SVG)
 */
const DefaultTrendingUpIcon = () => (
  <svg
    className="w-12 h-12 text-gray-400 mx-auto mb-3"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    />
  </svg>
);

/**
 * Default User Icon (SVG)
 */
const DefaultUserIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

/**
 * Default Clock Icon (SVG)
 */
const DefaultClockIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

/**
 * LiveBidHistory - Real-time bid history display
 *
 * A pure React component that displays auction bid history with animations.
 * Shows recent bids with user information, timestamps, and winning status.
 *
 * @example
 * ```tsx
 * const bids = [
 *   { id: "1", user_id: "user123", amount: 5000, created_at: "2024-01-18T10:00:00Z", is_winning: true },
 *   { id: "2", user_id: "user456", amount: 4500, created_at: "2024-01-18T09:55:00Z", is_winning: false },
 * ];
 *
 * <LiveBidHistory
 *   auctionId="auction123"
 *   bids={bids}
 *   currentBid={5000}
 *   formatPrice={(amount) => formatPrice(amount)}
 *   formatRelativeTime={(date) => formatRelativeTime(date)}
 * />
 * ```
 */
export function LiveBidHistory({
  auctionId,
  bids,
  currentBid,
  formatPrice = defaultFormatPrice,
  formatRelativeTime = defaultFormatRelativeTime,
  maskUserId = defaultMaskUserId,
  icons,
  className = "",
}: LiveBidHistoryProps) {
  const [animatedBids, setAnimatedBids] = useState<string[]>([]);

  // Animate new bids
  useEffect(() => {
    if (bids.length > 0) {
      const latestBid = bids[0];
      if (!animatedBids.includes(latestBid.id)) {
        setAnimatedBids((prev) => [latestBid.id, ...prev.slice(0, 9)]);
      }
    }
  }, [bids, animatedBids]);

  if (bids.length === 0) {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center ${className}`}
      >
        {icons?.emptyState || <DefaultTrendingUpIcon />}
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          No bids yet
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
          Be the first to bid!
        </p>
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Bid History
          </h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {bids.length} bid{bids.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Current:{" "}
          <span className="font-bold text-green-600 dark:text-green-400">
            {formatPrice(currentBid)}
          </span>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
        {bids.map((bid, index) => {
          const isLatest = index === 0;
          const isAnimated = animatedBids.includes(bid.id);

          return (
            <div
              key={bid.id}
              className={`px-4 py-3 transition-all duration-500 ${
                isAnimated
                  ? "bg-green-50 dark:bg-green-900/20 animate-pulse"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      isLatest
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    {icons?.user || (
                      <DefaultUserIcon
                        className={`w-4 h-4 ${
                          isLatest
                            ? "text-green-600 dark:text-green-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      />
                    )}
                  </div>

                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {maskUserId(bid.user_id)}
                      {bid.is_winning && (
                        <span className="ml-2 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">
                          Leading
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      {icons?.clock || <DefaultClockIcon className="w-3 h-3" />}
                      {formatRelativeTime(bid.created_at)}
                    </div>
                  </div>
                </div>

                <div
                  className={`text-right ${isLatest ? "animate-bounce" : ""}`}
                >
                  <div
                    className={`font-bold ${
                      isLatest
                        ? "text-green-600 dark:text-green-400 text-lg"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {formatPrice(bid.amount)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

