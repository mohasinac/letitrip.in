import { Loader2 } from "lucide-react";
import { ComponentType } from "react";

export interface SimilarAuctionData {
  id: string;
  productName: string;
  productSlug: string;
  productImage?: string;
  currentPrice?: number;
  startingBid: number;
  totalBids?: number;
  endTime: string;
  status: string;
  featured?: boolean;
  shopId?: string;
}

export interface AuctionCardData {
  id: string;
  name: string;
  slug: string;
  images: string[];
  currentBid: number;
  startingBid: number;
  bidCount: number;
  endTime: string;
  status: string;
  featured?: boolean;
  shop?: {
    id: string;
    name: string;
    isVerified: boolean;
  };
}

export interface SimilarAuctionsProps {
  auctions: SimilarAuctionData[];
  loading?: boolean;
  currentAuctionId?: string;
  title?: string;
  showShopInfo?: boolean;
  AuctionCardComponent: ComponentType<{
    auction: AuctionCardData;
    showShopInfo?: boolean;
    href?: string;
  }>;
  className?: string;
}

/**
 * SimilarAuctions Component
 *
 * Displays similar ongoing auctions in a grid layout.
 * Used on auction detail pages to show related auctions.
 *
 * Features:
 * - Grid of auction cards with responsive layout
 * - Filters out current auction from the list
 * - Loading state with spinner
 * - Conditional rendering (hidden if no results)
 * - Data transformation for auction cards
 * - Configurable title and shop info display
 *
 * @example
 * ```tsx
 * <SimilarAuctions
 *   auctions={similarAuctions}
 *   currentAuctionId="auction123"
 *   AuctionCardComponent={AuctionCard}
 * />
 * ```
 */
export function SimilarAuctions({
  auctions,
  loading = false,
  currentAuctionId,
  title = "Similar Auctions",
  showShopInfo = true,
  AuctionCardComponent,
  className = "",
}: SimilarAuctionsProps) {
  // Filter out current auction
  const filteredAuctions = auctions.filter(
    (auction) => auction.id !== currentAuctionId,
  );

  if (loading) {
    return (
      <div className={className}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {title}
        </h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (filteredAuctions.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {title}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAuctions.map((auction) => (
          <AuctionCardComponent
            key={auction.id}
            auction={{
              id: auction.id,
              name: auction.productName || "",
              slug: auction.productSlug || "",
              images: auction.productImage ? [auction.productImage] : [],
              currentBid: auction.currentPrice || auction.startingBid || 0,
              startingBid: auction.startingBid || 0,
              bidCount: auction.totalBids || 0,
              endTime: auction.endTime,
              status: auction.status,
              featured: auction.featured,
              shop: auction.shopId
                ? {
                    id: auction.shopId,
                    name: auction.shopId,
                    isVerified: false,
                  }
                : undefined,
            }}
            showShopInfo={showShopInfo}
            href={`/auctions/${auction.productSlug}`}
          />
        ))}
      </div>
    </div>
  );
}
