"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Gavel,
  Clock,
  Eye,
  Heart,
  Share2,
  Loader2,
  User,
  Calendar,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { auctionsService } from "@/services/auctions.service";
import { shopsService } from "@/services/shops.service";
import type {
  AuctionFE,
  AuctionCardFE,
  BidFE,
} from "@/types/frontend/auction.types";
import type { ShopFE } from "@/types/frontend/shop.types";
import { AuctionStatus } from "@/types/shared/common.types";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { CardGrid } from "@/components/cards/CardGrid";

export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const slug = params.slug as string;

  const [auction, setAuction] = useState<AuctionFE | null>(null);
  const [bids, setBids] = useState<BidFE[]>([]);
  const [shop, setShop] = useState<ShopFE | null>(null);
  const [similarAuctions, setSimilarAuctions] = useState<AuctionCardFE[]>([]);
  const [shopAuctions, setShopAuctions] = useState<AuctionCardFE[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [bidError, setBidError] = useState("");
  const [isWatching, setIsWatching] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (slug) {
      loadAuction();
    }
  }, [slug]);

  const loadAuction = async () => {
    try {
      setLoading(true);
      const data = await auctionsService.getBySlug(slug);
      setAuction(data);

      // Load bids
      const bidsResponse = await auctionsService.getBids(data.id, 1, 20);
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
            (shopAuctionsData.data || []).filter((a) => a.id !== data.id)
          );
        } catch (error) {
          console.error("Failed to load shop:", error);
        }
      }

      // Load similar auctions (same category or status)
      try {
        const similarData = await auctionsService.list({
          status: AuctionStatus.ACTIVE,
          limit: 6,
        });
        setSimilarAuctions(
          (similarData.data || []).filter((a) => a.id !== data.id)
        );
      } catch (error) {
        console.error("Failed to load similar auctions:", error);
      }

      // Set default bid amount (current bid + minimum increment)
      const currentBidValue = data.currentBid || data.currentPrice;
      const minIncrement = Math.max(100, currentBidValue * 0.05); // 5% or ₹100
      setBidAmount(Math.ceil(currentBidValue + minIncrement).toString());
    } catch (error) {
      console.error("Failed to load auction:", error);
    } finally {
      setLoading(false);
    }
  };

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

      await auctionsService.placeBid(auction.id, { amount, isAutoBid: false });

      // Reload auction and bids
      await loadAuction();

      // Show success message
      alert("Bid placed successfully!");
    } catch (error: any) {
      console.error("Failed to place bid:", error);
      setBidError(error.message || "Failed to place bid");
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
      const result = await auctionsService.toggleWatch(auction.id);
      setIsWatching(result.watching);
    } catch (error) {
      console.error("Failed to toggle watch:", error);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: auction?.name,
          text: `Check out this auction: ${auction?.name}`,
          url: url,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">
            Auction not found
          </h2>
          <Link
            href="/auctions"
            className="mt-4 inline-block text-primary hover:underline"
          >
            Browse all auctions
          </Link>
        </div>
      </div>
    );
  }

  const isLive = auction.status === AuctionStatus.ACTIVE;
  const hasEnded = auction.status === AuctionStatus.ENDED;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <span>/</span>
        <Link href="/auctions" className="hover:text-primary">
          Auctions
        </Link>
        <span>/</span>
        <span className="text-gray-900">{auction.name}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Images & Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            {auction.images && auction.images.length > 0 && (
              <>
                <div className="aspect-video w-full bg-gray-100 relative group">
                  <img
                    src={auction.images[selectedImage]}
                    alt={auction.name}
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  {auction.isFeatured && (
                    <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      ★ Featured
                    </div>
                  )}
                </div>
                {auction.images.length > 1 && (
                  <div className="grid grid-cols-5 gap-2 p-4 bg-gray-50">
                    {auction.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === idx
                            ? "border-primary ring-2 ring-primary ring-offset-2"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${auction.name} ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Description */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Description
            </h2>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: auction.description || auction.productDescription,
              }}
            />
          </div>

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
                        ₹{(bid.bidAmount || bid.amount).toLocaleString()}
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
          {shopAuctions.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                More from this shop
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {shopAuctions.map((a) => (
                  <Link
                    key={a.id}
                    href={`/auctions/${a.slug}`}
                    className="group"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
                      {a.images?.[0] && (
                        <img
                          src={a.images[0]}
                          alt={a.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      )}
                    </div>
                    <h3 className="font-medium text-sm text-gray-900 line-clamp-2 group-hover:text-primary">
                      {a.name}
                    </h3>
                    <p className="text-sm font-semibold text-primary mt-1">
                      ₹{(a.currentBid || a.currentPrice).toLocaleString()}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Similar Auctions Section */}
          {similarAuctions.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Similar Auctions
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {similarAuctions.map((a) => (
                  <Link
                    key={a.id}
                    href={`/auctions/${a.slug}`}
                    className="group"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2 relative">
                      {a.images?.[0] && (
                        <img
                          src={a.images[0]}
                          alt={a.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      )}
                      {a.status === AuctionStatus.ACTIVE && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                          Live
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-sm text-gray-900 line-clamp-2 group-hover:text-primary">
                      {a.name}
                    </h3>
                    <p className="text-sm font-semibold text-primary mt-1">
                      ₹{(a.currentBid || a.currentPrice).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {a.bidCount || a.totalBids}{" "}
                      {(a.bidCount || a.totalBids) === 1 ? "bid" : "bids"}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
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
                ₹{(auction.currentBid || auction.currentPrice).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {auction.bidCount || auction.totalBids}{" "}
                {(auction.bidCount || auction.totalBids) === 1 ? "bid" : "bids"}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Bid Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => {
                      setBidAmount(e.target.value);
                      setBidError("");
                    }}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    min={(auction.currentBid || auction.currentPrice) + 1}
                    step="100"
                  />
                  {bidError && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {bidError}
                    </p>
                  )}
                </div>
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
                  ₹{auction.startingPrice.toLocaleString()}
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
                  {new Date(auction.endTime).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Shop Info Sidebar */}
          {shop && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Seller Information
              </h3>
              <div className="space-y-4">
                {/* Shop Logo */}
                {shop.logo && (
                  <div className="flex justify-center">
                    <img
                      src={shop.logo}
                      alt={shop.name}
                      className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
                    />
                  </div>
                )}

                {/* Shop Name */}
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900">{shop.name}</h4>
                  {shop.isVerified && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-1">
                      ✓ Verified Seller
                    </span>
                  )}
                </div>

                {/* Rating */}
                {shop.rating > 0 && (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <div className="flex items-center gap-1 text-yellow-500">
                      {"★".repeat(Math.round(shop.rating))}
                      {"☆".repeat(5 - Math.round(shop.rating))}
                    </div>
                    <span className="text-gray-600">
                      {shop.rating.toFixed(1)} ({shop.reviewCount || 0})
                    </span>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {shop.productCount || 0}
                    </p>
                    <p className="text-xs text-gray-600">Products</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {shopAuctions.length + 1}
                    </p>
                    <p className="text-xs text-gray-600">Auctions</p>
                  </div>
                </div>

                {/* Visit Shop Button */}
                <Link
                  href={`/shops/${shop.slug}`}
                  className="block w-full text-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
                >
                  Visit Shop
                </Link>

                {/* Contact Seller Button */}
                {shop.email && (
                  <a
                    href={`mailto:${shop.email}`}
                    className="block w-full text-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Contact Seller
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
