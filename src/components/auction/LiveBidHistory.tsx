/**
 * Live Bid History
 *
 * Real-time bid history with Socket.io updates
 * Shows recent bids with animations
 */

"use client";

import { formatRelativeTime } from "@/lib/formatters";
import { formatPrice } from "@/lib/price.utils";
import { Clock, TrendingUp, User } from "lucide-react";
import { useEffect, useState } from "react";

interface Bid {
  id: string;
  user_id: string;
  amount: number;
  created_at: string;
  is_winning: boolean;
}

interface LiveBidHistoryProps {
  auctionId: string;
  bids: Bid[];
  currentBid: number;
  className?: string;
}

export default function LiveBidHistory({
  auctionId,
  bids,
  currentBid,
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
  }, [bids]);

  if (bids.length === 0) {
    return (
      <div
        className={`bg-white rounded-lg border p-6 text-center ${className}`}
      >
        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">No bids yet</p>
        <p className="text-sm text-gray-500 mt-1">Be the first to bid!</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      <div className="px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Bid History</h3>
          <span className="text-sm text-gray-600">
            {bids.length} bid{bids.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="mt-1 text-sm text-gray-600">
          Current:{" "}
          <span className="font-bold text-green-600">
            {formatPrice(currentBid)}
          </span>
        </div>
      </div>

      <div className="divide-y max-h-96 overflow-y-auto">
        {bids.map((bid, index) => {
          const isLatest = index === 0;
          const isAnimated = animatedBids.includes(bid.id);

          return (
            <div
              key={bid.id}
              className={`px-4 py-3 transition-all duration-500 ${
                isAnimated ? "bg-green-50 animate-pulse" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      isLatest ? "bg-green-100" : "bg-gray-100"
                    }`}
                  >
                    <User
                      className={`w-4 h-4 ${
                        isLatest ? "text-green-600" : "text-gray-600"
                      }`}
                    />
                  </div>

                  <div>
                    <div className="font-medium text-gray-900">
                      {maskUserId(bid.user_id)}
                      {bid.is_winning && (
                        <span className="ml-2 text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded">
                          Leading
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(bid.created_at)}
                    </div>
                  </div>
                </div>

                <div
                  className={`text-right ${isLatest ? "animate-bounce" : ""}`}
                >
                  <div
                    className={`font-bold ${
                      isLatest ? "text-green-600 text-lg" : "text-gray-900"
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

/**
 * Mask user ID for privacy
 * Example: user123456 → u***56
 */
function maskUserId(userId: string): string {
  if (userId.length <= 4) return userId;
  const start = userId.substring(0, 1);
  const end = userId.substring(userId.length - 2);
  return `${start}***${end}`;
}
