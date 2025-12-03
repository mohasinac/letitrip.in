"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import { Heart, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { auctionsService } from "@/services/auctions.service";
import { useLoadingState } from "@/hooks/useLoadingState";
import AuctionCard from "@/components/cards/AuctionCard";
import type { AuctionCardFE } from "@/types/frontend/auction.types";
import { AuctionStatus } from "@/types/shared/common.types";

export default function WatchlistPage() {
  const { user } = useAuth();
  const {
    data: auctions,
    isLoading: loading,
    error,
    execute,
    setData: setAuctions,
    retry,
  } = useLoadingState<AuctionCardFE[]>({ initialData: [] });

  const loadWatchlist = useCallback(async () => {
    const data = await auctionsService.getWatchlist();
    return data || [];
  }, []);

  useEffect(() => {
    if (user) {
      execute(loadWatchlist);
    }
  }, [user, execute, loadWatchlist]);

  const handleRemoveFromWatchlist = async (auctionId: string) => {
    try {
      await auctionsService.toggleWatch(auctionId);

      // Remove from local state
      const updatedAuctions = (auctions || []).filter(
        (auction) => auction.id !== auctionId
      );
      setAuctions(updatedAuctions);
    } catch (error) {
      console.error("Failed to remove from watchlist:", error);
    }
  };

  // Safe access to auctions array
  const auctionsList = auctions || [];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Please log in to view your watchlist
          </h3>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2
          className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400"
          data-testid="loading-spinner"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 dark:text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Error
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {error.message}
          </p>
          <button
            onClick={retry}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 text-red-500 dark:text-red-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Watchlist
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Track your favorite auctions and never miss a bidding opportunity
          </p>
        </div>

        {/* Stats */}
        {auctionsList.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Total Watched
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {auctionsList.length}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Active Auctions
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {
                    auctionsList.filter(
                      (a) => a.status === AuctionStatus.ACTIVE
                    ).length
                  }
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Ending Soon
                </div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {
                    auctionsList.filter((a) => {
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
        {auctionsList.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <Heart className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No auctions in your watchlist
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start watching auctions to keep track of items you're interested
              in
            </p>
            <Link
              href="/auctions"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Browse Auctions
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {auctionsList.map((auction) => (
              <AuctionCard
                key={auction.id}
                auction={
                  {
                    ...auction,
                    name: auction.productName || "",
                    slug: auction.productSlug || "",
                    images: [auction.productImage],
                    currentBid: auction.currentBid || auction.startingBid || 0,
                  } as any
                }
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
