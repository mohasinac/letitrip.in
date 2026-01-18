
import { AlertCircle, Clock, Eye, Gavel, ShoppingCart } from "lucide-react";
import { ReactNode, useState } from "react";

export interface AuctionInfoProps {
  auctionId: string;
  currentBid: number;
  startingBid: number;
  reservePrice?: number;
  hasReserveMet?: boolean;
  endTime: string;
  bidCount: number;
  buyNowPrice?: number;
  minBidIncrement: number;
  isWatching?: boolean;
  canBid?: boolean;
  onPlaceBid?: (amount: number) => Promise<void>;
  onBuyNow?: () => Promise<void>;
  onToggleWatch?: () => Promise<void>;
  className?: string;
  // Injected dependencies
  PriceComponent?: React.ComponentType<{ amount: number }>;
  VerificationGateComponent?: React.ComponentType<{
    requireEmail?: boolean;
    requirePhone?: boolean;
    actionName?: string;
    children: ReactNode;
  }>;
  onBidSuccess?: (message: string) => void;
  onBidError?: (message: string) => void;
  onPurchaseSuccess?: (message: string) => void;
  onPurchaseError?: (message: string) => void;
  onWatchSuccess?: (message: string, isWatching: boolean) => void;
  onWatchError?: (message: string) => void;
}

/**
 * AuctionInfo Component
 *
 * Pure React component for displaying auction bidding information and controls.
 * Framework-independent implementation with callback injection pattern.
 *
 * Features:
 * - Large current bid display
 * - Reserve price indicator
 * - Live countdown timer
 * - Bid input with increment buttons
 * - Buy now button (if available)
 * - Watch/unwatch button
 * - Bid count and starting bid
 *
 * @example
 * ```tsx
 * <AuctionInfo
 *   auctionId="auction123"
 *   currentBid={15000}
 *   startingBid={10000}
 *   reservePrice={20000}
 *   endTime="2025-12-31T23:59:59Z"
 *   bidCount={25}
 *   onPlaceBid={handlePlaceBid}
 *   PriceComponent={Price}
 *   VerificationGateComponent={VerificationGate}
 *   onBidSuccess={(msg) => toast.success(msg)}
 *   onBidError={(msg) => toast.error(msg)}
 * />
 * ```
 */
export function AuctionInfo({
  auctionId,
  currentBid,
  startingBid,
  reservePrice,
  hasReserveMet = false,
  endTime,
  bidCount,
  buyNowPrice,
  minBidIncrement,
  isWatching = false,
  canBid = true,
  onPlaceBid,
  onBuyNow,
  onToggleWatch,
  className = "",
  PriceComponent,
  VerificationGateComponent,
  onBidSuccess,
  onBidError,
  onPurchaseSuccess,
  onPurchaseError,
  onWatchSuccess,
  onWatchError,
}: AuctionInfoProps) {
  const [bidAmount, setBidAmount] = useState(
    currentBid > 0 ? currentBid + minBidIncrement : startingBid,
  );
  const [placing, setPlacing] = useState(false);

  // Default Price component (fallback if not injected)
  const Price =
    PriceComponent ||
    (({ amount }: { amount: number }) => (
      <span>₹{amount.toLocaleString("en-IN")}</span>
    ));

  // Default VerificationGate (passthrough if not injected)
  const VerificationGate =
    VerificationGateComponent ||
    (({ children }: { children: ReactNode }) => <>{children}</>);

  const handleIncrementBid = (amount: number) => {
    setBidAmount((prev) => prev + amount);
  };

  const handlePlaceBid = async () => {
    if (!onPlaceBid) return;

    if (bidAmount < currentBid + minBidIncrement && currentBid > 0) {
      onBidError?.(
        `Bid must be at least ₹${minBidIncrement.toLocaleString()} higher`,
      );
      return;
    }

    if (bidAmount < startingBid && currentBid === 0) {
      onBidError?.(`Bid must be at least the starting bid`);
      return;
    }

    try {
      setPlacing(true);
      await onPlaceBid(bidAmount);
      onBidSuccess?.("Bid placed successfully!");
    } catch (error: any) {
      onBidError?.(error.message || "Failed to place bid");
    } finally {
      setPlacing(false);
    }
  };

  const handleBuyNow = async () => {
    if (!onBuyNow) return;

    try {
      await onBuyNow();
      onPurchaseSuccess?.("Purchase successful!");
    } catch (error: any) {
      onPurchaseError?.(error.message || "Failed to purchase");
    }
  };

  const handleToggleWatch = async () => {
    if (!onToggleWatch) return;

    try {
      await onToggleWatch();
      onWatchSuccess?.(
        isWatching ? "Removed from watchlist" : "Added to watchlist",
        !isWatching,
      );
    } catch (error: any) {
      onWatchError?.(error.message || "Failed to update watchlist");
    }
  };

  // Calculate time remaining
  const timeRemaining = new Date(endTime).getTime() - Date.now();
  const hasEnded = timeRemaining <= 0;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6 ${className}`}
    >
      {/* Current Bid */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
          <Gavel className="w-4 h-4" />
          <span>Current Bid</span>
        </div>
        <div className="text-4xl font-bold text-gray-900 dark:text-white">
          {currentBid > 0 ? (
            <Price amount={currentBid} />
          ) : (
            <Price amount={startingBid} />
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {bidCount} {bidCount === 1 ? "bid" : "bids"} • Starting bid:{" "}
          <Price amount={startingBid} />
        </p>
      </div>

      {/* Reserve Price Indicator */}
      {reservePrice && (
        <div
          className={`flex items-center gap-2 text-sm ${
            hasReserveMet
              ? "text-green-600 dark:text-green-400"
              : "text-orange-600 dark:text-orange-400"
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>
            {hasReserveMet ? "Reserve price met" : "Reserve price not met"}
          </span>
        </div>
      )}

      {/* Time Remaining */}
      {!hasEnded && (
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Clock className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Time Left
            </p>
            <p className="font-semibold">
              {Math.floor(timeRemaining / (1000 * 60 * 60 * 24))}d{" "}
              {Math.floor((timeRemaining / (1000 * 60 * 60)) % 24)}h{" "}
              {Math.floor((timeRemaining / (1000 * 60)) % 60)}m
            </p>
          </div>
        </div>
      )}

      {hasEnded && (
        <div className="text-red-600 dark:text-red-400 font-semibold">
          Auction Ended
        </div>
      )}

      {/* Bid Input */}
      {!hasEnded && canBid && onPlaceBid && (
        <VerificationGate requireEmail requirePhone actionName="place bid">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Your Bid
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(parseFloat(e.target.value) || 0)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                min={
                  currentBid > 0 ? currentBid + minBidIncrement : startingBid
                }
                step={minBidIncrement}
              />
              <button
                type="button"
                onClick={() => handleIncrementBid(minBidIncrement)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                +{minBidIncrement}
              </button>
            </div>

            <button
              type="button"
              onClick={handlePlaceBid}
              disabled={
                placing ||
                bidAmount <
                  (currentBid > 0 ? currentBid + minBidIncrement : startingBid)
              }
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Gavel className="w-5 h-5" />
              {placing ? "Placing Bid..." : "Place Bid"}
            </button>
          </div>
        </VerificationGate>
      )}

      {/* Buy Now Button */}
      {!hasEnded && buyNowPrice && onBuyNow && (
        <button
          type="button"
          onClick={handleBuyNow}
          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-5 h-5" />
          Buy Now - <Price amount={buyNowPrice} />
        </button>
      )}

      {/* Watch Button */}
      {onToggleWatch && (
        <button
          type="button"
          onClick={handleToggleWatch}
          className={`w-full px-6 py-2 border rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            isWatching
              ? "border-primary text-primary bg-primary/10"
              : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          <Eye className="w-5 h-5" />
          {isWatching ? "Watching" : "Watch"}
        </button>
      )}

      {/* Info Text */}
      {!hasEnded && canBid && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          By bidding, you agree to the auction terms and conditions.
        </p>
      )}
    </div>
  );
}

export default AuctionInfo;

