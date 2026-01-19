/**
 * @deprecated Use SimilarItems from @letitrip/react-library/common instead
 */
import { ComponentType } from "react";
import { SimilarItems } from "../common/SimilarItems";

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

// Transform SimilarAuctionData to format expected by card
function transformAuction(auction: SimilarAuctionData): AuctionCardData {
  return {
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
  };
}

/**
 * @deprecated Use SimilarItems component instead
 * This is a backward compatibility wrapper
 */
export function SimilarAuctions({
  auctions,
  loading,
  currentAuctionId,
  title = "Similar Auctions",
  showShopInfo,
  AuctionCardComponent,
  className,
}: SimilarAuctionsProps) {
  // Transform auctions to required format
  const transformedAuctions = auctions.map(transformAuction);

  // Create wrapper component to pass transformed data
  const AuctionCardWrapper = ({ item }: { item: AuctionCardData }) => (
    <AuctionCardComponent
      auction={item}
      showShopInfo={showShopInfo}
      href={`/auctions/${item.slug}`}
    />
  );

  return (
    <SimilarItems
      items={transformedAuctions}
      currentItemId={currentAuctionId}
      loading={loading}
      title={title}
      showViewAllButton={false}
      ItemCardComponent={AuctionCardWrapper}
      className={className}
    />
  );
}
