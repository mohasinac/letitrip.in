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
import type { Auction, Bid } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const slug = params.slug as string;

  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [bidError, setBidError] = useState("");
  const [isWatching, setIsWatching] = useState(false);

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

      // Set default bid amount (current bid + minimum increment)
      const minIncrement = Math.max(100, data.currentBid * 0.05); // 5% or ₹100
      setBidAmount(Math.ceil(data.currentBid + minIncrement).toString());
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
    if (isNaN(amount) || amount <= auction.currentBid) {
      setBidError("Bid must be higher than current bid");
      return;
    }

    try {
      setIsPlacingBid(true);
      setBidError("");

      await auctionsService.placeBid(auction.id, { bidAmount: amount });

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
    if (!auction) return "";

    const now = new Date();
    const end = new Date(auction.endTime);
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

  const isLive = auction.status === "live";
  const hasEnded = auction.status === "ended";

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
            {auction.images && auction.images[0] && (
              <div className="aspect-video w-full bg-gray-100">
                <img
                  src={auction.images[0]}
                  alt={auction.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            {auction.images && auction.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 p-4">
                {auction.images.slice(1, 5).map((img, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-lg overflow-hidden border border-gray-200"
                  >
                    <img
                      src={img}
                      alt={`${auction.name} ${idx + 2}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Description
            </h2>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: auction.description }}
            />
          </div>

          {/* Bid History */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Bid History ({auction.bidCount})
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
                          {formatDistanceToNow(new Date(bid.bidTime), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        ₹{bid.bidAmount.toLocaleString()}
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
                ₹{auction.currentBid.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {auction.bidCount} {auction.bidCount === 1 ? "bid" : "bids"}
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
                    min={auction.currentBid + 1}
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
                  ₹{auction.startingBid.toLocaleString()}
                </span>
              </div>
              {auction.reservePrice && auction.reservePrice > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Reserve Price:</span>
                  <span className="font-medium text-gray-900">
                    {auction.currentBid >= auction.reservePrice ? (
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
        </div>
      </div>
    </div>
  );
}
