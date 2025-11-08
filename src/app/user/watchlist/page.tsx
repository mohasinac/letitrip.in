"use client";

import { useState, useEffect } from "react";
import { Heart, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AuctionCard from "@/components/cards/AuctionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { formatCurrency } from "@/lib/formatters";

interface WatchlistItem {
  id: string;
  auction_id: string;
  user_id: string;
  type: string;
  created_at: any;
}

interface Auction {
  id: string;
  name: string;
  slug: string;
  images: string[];
  currentBid: number;
  startingBid: number;
  bidCount: number;
  endTime: Date | string;
  status: string;
  condition?: "new" | "used" | "refurbished";
  shop?: {
    id: string;
    name: string;
    logo?: string;
    isVerified?: boolean;
  };
}

export default function WatchlistPage() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadWatchlist();
    }
  }, [user]);

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch watchlist
      const response = await fetch("/api/auctions/watchlist");
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to load watchlist");
      }

      const watchlistData = result.data || [];
      setWatchlist(watchlistData);

      // Fetch auction details for each watchlist item
      if (watchlistData.length > 0) {
        const auctionPromises = watchlistData.map((item: WatchlistItem) =>
          fetch(`/api/auctions/${item.auction_id}`).then((res) => res.json())
        );

        const auctionResults = await Promise.allSettled(auctionPromises);
        const auctionData = auctionResults
          .filter(
            (result) => result.status === "fulfilled" && result.value.success
          )
          .map((result: any) => result.value.data);

        setAuctions(auctionData);
      }
    } catch (error) {
      console.error("Failed to load watchlist:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load watchlist"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWatchlist = async (auctionId: string) => {
    try {
      const response = await fetch("/api/auctions/watchlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auction_id: auctionId }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove from watchlist");
      }

      // Remove from local state
      setWatchlist((prev) =>
        prev.filter((item) => item.auction_id !== auctionId)
      );
      setAuctions((prev) => prev.filter((auction) => auction.id !== auctionId));
    } catch (error) {
      console.error("Failed to remove from watchlist:", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Please log in to view your watchlist
          </h3>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={loadWatchlist}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">My Watchlist</h1>
          </div>
          <p className="text-gray-600">
            Track your favorite auctions and never miss a bidding opportunity
          </p>
        </div>

        {/* Stats */}
        {auctions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Watched</div>
                <div className="text-2xl font-bold text-gray-900">
                  {auctions.length}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">
                  Active Auctions
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {auctions.filter((a) => a.status === "live").length}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Ending Soon</div>
                <div className="text-2xl font-bold text-red-600">
                  {
                    auctions.filter((a) => {
                      const endTime =
                        typeof a.endTime === "string"
                          ? new Date(a.endTime)
                          : a.endTime;
                      const hoursRemaining =
                        (endTime.getTime() - Date.now()) / (1000 * 60 * 60);
                      return hoursRemaining <= 24 && hoursRemaining > 0;
                    }).length
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Auctions Grid */}
        {auctions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No auctions in your watchlist
            </h3>
            <p className="text-gray-600 mb-6">
              Start watching auctions to keep track of items you're interested
              in
            </p>
            <a
              href="/auctions"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Auctions
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {auctions.map((auction) => (
              <AuctionCard
                key={auction.id}
                auction={{
                  ...auction,
                  currentBid: auction.currentBid || auction.startingBid,
                }}
                onWatch={handleRemoveFromWatchlist}
                isWatched={true}
                showShopInfo={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
