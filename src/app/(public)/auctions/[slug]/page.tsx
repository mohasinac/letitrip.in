"use client";

import { AuctionDescription } from "@/components/auction/AuctionDescription";
import { AuctionGallery } from "@/components/auction/AuctionGallery";
import { AuctionSellerInfo } from "@/components/auction/AuctionSellerInfo";
import { SimilarAuctions } from "@/components/auction/SimilarAuctions";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import OptimizedImage from "@/components/common/OptimizedImage";
import { AuctionCardSkeletonGrid } from "@/components/common/skeletons/AuctionCardSkeleton";
import { DateDisplay } from "@/components/common/values/DateDisplay";
import { Price } from "@/components/common/values/Price";
import { FormInput } from "@/components/forms/FormInput";
import { useAuth } from "@/contexts/AuthContext";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import { formatINR } from "@/lib/price.utils";
import { auctionsService } from "@/services/auctions.service";
import { shopsService } from "@/services/shops.service";
import type {
  AuctionCardFE,
  AuctionFE,
  BidFE,
} from "@/types/frontend/auction.types";
import type { ShopFE } from "@/types/frontend/shop.types";
import { AuctionStatus } from "@/types/shared/common.types";
import { formatDistanceToNow } from "date-fns";
import {
  Calendar,
  Clock,
  Gavel,
  Heart,
  Loader2,
  Share2,
  TrendingUp,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const slug = params.slug as string;

  const [bids, setBids] = useState<BidFE[]>([]);
  const [shop, setShop] = useState<ShopFE | null>(null);
  const [similarAuctions, setSimilarAuctions] = useState<AuctionCardFE[]>([]);
  const [shopAuctions, setShopAuctions] = useState<AuctionCardFE[]>([]);
  const [bidAmount, setBidAmount] = useState("");
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [bidError, setBidError] = useState("");
  const [isWatching, setIsWatching] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const {
    isLoading: loading,
    error,
    data: auction,
    setData: setAuction,
    execute,
  } = useLoadingState<AuctionFE>({
    onLoadError: (err) => {
      logError(err, {
        component: "AuctionDetailPage.loadAuction",
        metadata: { slug },
      });
    },
  });

  useEffect(() => {
    if (slug) {
      loadAuction();
    }
  }, [slug]);

  const loadAuction = () =>
    execute(async () => {
      const data = await auctionsService.getBySlug(slug);

      // Load bids using slug
      const bidsResponse = await auctionsService.getBids(slug, 20, null);
      setBids(bidsResponse.data || []);

      // Load shop
      if (data.shopId) {
        try {
          const shopData = await shopsService.getBySlug(data.shopId);
          setShop(shopData);

          // Load other auctions from this shop
          const shopAuctionsData = await auctionsService.list({
            shopId: data.shopId,
            status: AuctionStatus.ACTIVE,
            limit: 6,
          });
          setShopAuctions(
            (shopAuctionsData.data || []).filter((a) => a.slug !== slug),
          );
        } catch (error) {
          logError(error as Error, {
            component: "AuctionDetailPage.loadShop",
            metadata: { slug, shopId: data.shopId },
          });
          // Non-critical error, continue showing auction
        }
      }

      // Load similar auctions (same category or status)
      try {
        const similarData = await auctionsService.list({
          status: AuctionStatus.ACTIVE,
          limit: 6,
        });
        setSimilarAuctions(
          (similarData.data || []).filter((a) => a.slug !== slug),
        );
      } catch (error) {
        logError(error as Error, {
          component: "AuctionDetailPage.loadSimilarAuctions",
          metadata: { slug },
        });
        // Non-critical error, continue showing auction
      }

      // Set default bid amount (current bid + minimum increment)
      const currentBidValue = data.currentBid || data.currentPrice;
      const minIncrement = Math.max(100, currentBidValue * 0.05); // 5% or ₹100
      setBidAmount(Math.ceil(currentBidValue + minIncrement).toString());
      return data;
    });

  const handlePlaceBid = async () => {
    if (!user) {
      router.push(`/login?redirect=/auctions/${slug}`);
      return;
    }

    if (!auction) return;

    const amount = parseFloat(bidAmount);
    const currentBidValue = auction.currentBid || auction.currentPrice;
    if (isNaN(amount) || amount <= currentBidValue) {
      setBidError("Bid must be higher than current bid");
      return;
    }

    try {
      setIsPlacingBid(true);
      setBidError("");

      await auctionsService.placeBid(slug, { amount, isAutoBid: false });

      // Reload auction and bids
      await loadAuction();

      // Show success message
      toast.success("Bid placed successfully!");
    } catch (error: any) {
      logError(error as Error, {
        component: "AuctionDetailPage.handlePlaceBid",
        metadata: { slug, amount: parseFloat(bidAmount) },
      });
      const errorMessage =
        error.message || "Failed to place bid. Please try again.";
      setBidError(errorMessage);

      // Also show as toast for better visibility
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsPlacingBid(false);
    }
  };

  const handleToggleWatch = async () => {
    if (!user) {
      router.push(`/login?redirect=/auctions/${slug}`);
      return;
    }

    if (!auction) return;

    try {
      const result = await auctionsService.toggleWatch(slug);
      setIsWatching(result.watching);
    } catch (error) {
      logError(error as Error, {
        component: "AuctionDetailPage.handleToggleWatch",
        metadata: { slug },
      });
    }
  };

  const handleShare = async () => {
    const url = globalThis.location?.href || "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: auction?.name,
          text: `Check out this auction: ${auction?.name}`,
          url: url,
        });
      } catch (error) {
        logError(error as Error, {
          component: "AuctionDetailPage.handleShare",
          metadata: { slug },
        });
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const getTimeRemaining = () => {
    if (!auction || !auction.endTime) return "";

    const now = new Date();
    const end = new Date(auction.endTime);

    // Check if date is valid
    if (isNaN(end.getTime())) return "Auction ended";

    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Auction ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
          </div>
          <AuctionCardSkeletonGrid count={1} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ErrorMessage
          message={error.message || "Failed to load auction. Please try again."}
          showRetry
          onRetry={loadAuction}
          onGoBack={() => router.back()}
        />
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <ErrorMessage
          message="Auction not found. It may have ended or been removed."
          onGoBack={() => router.push("/auctions")}
        />
      </div>
    );
  }

  // Check if auction has ended
  const auctionEnded =
    auction.endTime && new Date(auction.endTime) < new Date();

  if (auctionEnded && auction.status === AuctionStatus.ENDED) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <ErrorMessage
          message="This auction has ended. Check out other active auctions."
          onGoBack={() => router.push("/auctions")}
        />
      </div>
    );
  }

  const isLive = auction.status === AuctionStatus.ACTIVE;
  const hasEnded = auction.status === AuctionStatus.ENDED;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-600">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/auctions" className="hover:text-primary transition-colors">
          Auctions
        </Link>
        <span>/</span>
        <span className="text-gray-900 truncate max-w-xs">{auction.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Images & Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <AuctionGallery
            media={(auction.images || []).map((url) => ({
              url,
              type: "image" as const,
            }))}
            productName={auction.name || "Auction"}
          />

          {/* Description */}
          <AuctionDescription
            description={
              auction.description || auction.productDescription || ""
            }
          />

          {/* Bid History */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Bid History ({auction.bidCount || auction.totalBids})
            </h2>
            {bids.length === 0 ? (
              <p className="text-sm text-gray-600">No bids yet</p>
            ) : (
              <div className="space-y-3">
                {bids.map((bid, idx) => (
                  <div
                    key={bid.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      idx === 0
                        ? "bg-green-50 border border-green-200"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          User #{bid.userId.slice(-6)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(bid.bidTime || bid.createdAt, {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        <Price amount={bid.bidAmount || bid.amount} />
                      </p>
                      {idx === 0 && (
                        <p className="text-xs text-green-600">Winning bid</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Shop Auctions Section */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              More from this shop
            </h2>
            {shopAuctions.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {shopAuctions.map((a) => (
                  <Link
                    key={a.id}
                    href={`/auctions/${a.slug}`}
                    className="group"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2 relative">
                      {a.images?.[0] && (
                        <OptimizedImage
                          src={a.images[0]}
                          alt={a.name || "Auction"}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      )}
                    </div>
                    <h3 className="font-medium text-sm text-gray-900 line-clamp-2 group-hover:text-primary">
                      {a.name}
                    </h3>
                    <p className="text-sm font-semibold text-primary mt-1">
                      <Price amount={a.currentBid || a.currentPrice} />
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <Gavel className="w-10 h-10 text-gray-400 mb-3" />
                <p className="text-gray-500 mb-4 text-sm">
                  No more auctions from this shop
                </p>
                <Link
                  href="/auctions"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  View All Auctions
                </Link>
              </div>
            )}
          </div>

          {/* Similar Auctions Section */}
          <SimilarAuctions
            auctions={similarAuctions}
            currentAuctionId={auction.id}
            loading={false}
          />
        </div>

        {/* Right Column - Bidding Panel */}
        <div className="space-y-6">
          {/* Main Bidding Card */}
          <div className="sticky top-4 rounded-lg border border-gray-200 bg-white p-6 space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">{auction.name}</h1>

            {/* Status Badge */}
            <div>
              {isLive && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                  <span className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                  Live Auction
                </span>
              )}
              {hasEnded && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
                  Auction Ended
                </span>
              )}
              {auction.status === "scheduled" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                  Upcoming
                </span>
              )}
            </div>

            {/* Current Bid */}
            <div className="border-t border-b border-gray-200 py-4">
              <p className="text-sm text-gray-600">Current Bid</p>
              <p className="text-3xl font-bold text-primary">
                {formatINR(auction.currentBid || auction.currentPrice)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {auction.bidCount || auction.totalBids || 0}{" "}
                {(auction.bidCount || auction.totalBids || 0) === 1
                  ? "bid"
                  : "bids"}
              </p>
            </div>

            {/* Time Remaining */}
            {isLive && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <Clock className="h-5 w-5" />
                  <p className="text-sm font-medium">Time Remaining</p>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {getTimeRemaining()}
                </p>
              </div>
            )}

            {/* Bid Form */}
            {isLive && (
              <div className="space-y-3">
                <FormInput
                  label="Your Bid Amount (₹)"
                  type="number"
                  value={bidAmount}
                  onChange={(e) => {
                    setBidAmount(e.target.value);
                    setBidError("");
                  }}
                  min={(auction.currentBid || auction.currentPrice) + 1}
                  step="100"
                  error={bidError}
                  className="text-lg font-semibold"
                />
                <button
                  onClick={handlePlaceBid}
                  disabled={isPlacingBid}
                  className="w-full rounded-lg bg-primary px-6 py-3 text-lg font-medium text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPlacingBid ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Placing Bid...
                    </>
                  ) : (
                    <>
                      <Gavel className="h-5 w-5" />
                      Place Bid
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={handleToggleWatch}
                className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  isWatching
                    ? "border-red-300 bg-red-50 text-red-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${isWatching ? "fill-current" : ""}`}
                />
                {isWatching ? "Watching" : "Watch"}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>

            {/* Auction Details */}
            <div className="pt-4 border-t border-gray-200 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Starting Bid:</span>
                <span className="font-medium text-gray-900">
                  {formatINR(auction.startingPrice)}
                </span>
              </div>
              {auction.reservePrice && auction.reservePrice > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Reserve Price:</span>
                  <span className="font-medium text-gray-900">
                    {(auction.currentBid || auction.currentPrice) >=
                    auction.reservePrice ? (
                      <span className="text-green-600">Met</span>
                    ) : (
                      <span className="text-red-600">Not Met</span>
                    )}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Ends:
                </span>
                <span className="font-medium text-gray-900">
                  <DateDisplay date={auction.endTime} includeTime />
                </span>
              </div>
            </div>
          </div>

          {/* Shop Info Sidebar */}
          {shop && (
            <AuctionSellerInfo
              sellerId={shop.id}
              sellerName={shop.name}
              sellerAvatar={shop.logo || undefined}
              sellerRating={shop.rating}
              sellerReviewCount={shop.reviewCount || 0}
              memberSince={
                shop.createdAt
                  ? typeof shop.createdAt === "string"
                    ? shop.createdAt
                    : shop.createdAt.toISOString()
                  : ""
              }
              shopId={shop.id}
              shopName={shop.name}
              shopSlug={shop.slug}
              onContactSeller={() => {
                if (shop.email) {
                  window.location.href = `mailto:${shop.email}`;
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
