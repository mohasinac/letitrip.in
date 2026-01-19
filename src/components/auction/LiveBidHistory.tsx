import type { BidData, LiveBidHistoryProps } from "@letitrip/react-library";
import {
  formatPrice,
  formatRelativeTime,
  LiveBidHistory as LiveBidHistoryBase,
} from "@letitrip/react-library";
import { Clock, TrendingUp, User } from "lucide-react";

/**
 * LiveBidHistory wrapper with app-specific formatting and icons
 *
 * This wrapper provides the default formatters and lucide-react icons.
 * The library component is framework-agnostic.
 */
export default function LiveBidHistory({
  auctionId,
  bids,
  currentBid,
  formatPrice: customFormatPrice,
  formatRelativeTime: customFormatRelativeTime,
  icons,
  ...props
}: Omit<LiveBidHistoryProps, "formatPrice" | "formatRelativeTime" | "icons"> & {
  auctionId: string;
  bids: BidData[];
  currentBid: number;
  formatPrice?: (amount: number) => string;
  formatRelativeTime?: (date: string) => string;
  icons?: LiveBidHistoryProps["icons"];
}) {
  const defaultIcons = {
    emptyState: <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />,
    user: <User className="w-4 h-4" />,
    clock: <Clock className="w-3 h-3" />,
  };

  return (
    <LiveBidHistoryBase
      auctionId={auctionId}
      bids={bids}
      currentBid={currentBid}
      formatPrice={customFormatPrice || formatPrice}
      formatRelativeTime={customFormatRelativeTime || formatRelativeTime}
      icons={icons || defaultIcons}
      {...props}
    />
  );
}
