"use client";

import { useState, useEffect, useCallback } from "react";
import { Gavel, AlertCircle, Loader2, TrendingUp, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { auctionsService } from "@/services/auctions.service";
import { useLoadingState } from "@/hooks/useLoadingState";
import { PageState } from "@/components/common/PageState";
import { StatsCard, StatsCardGrid } from "@/components/common/StatsCard";
import { formatCurrency, formatDate } from "@/lib/formatters";
import Link from "next/link";
import Image from "next/image";

interface Bid {
  id: string;
  auction_id: string;
  user_id: string;
  amount: number;
  created_at: any;
  is_auto_bid?: boolean;
}

interface AuctionDetails {
  id: string;
  name: string;
  slug: string;
  images: string[];
  currentBid: number;
  startingBid: number;
  bidCount: number;
  endTime: Date | string;
  status: string;
  highest_bidder_id?: string;
}

interface BidWithAuction extends Bid {
  auction?: AuctionDetails;
  isWinning?: boolean;
  isOutbid?: boolean;
}

export default function MyBidsPage() {
  const { user } = useAuth();
  const {
    data: bids,
    isLoading: loading,
    error,
    execute,
  } = useLoadingState<BidWithAuction[]>({ initialData: [] });

  const loadBids = useCallback(async () => {
    // Fetch user's bids with auction details
    const bidsData = await auctionsService.getMyBids();

    // Group bids by auction and get latest bid per auction
    const auctionBidsMap = new Map<string, any>();
    bidsData.forEach((bid: any) => {
      const existing = auctionBidsMap.get(bid.auction_id);
      if (
        !existing ||
        new Date(bid.created_at) > new Date(existing.created_at)
      ) {
        auctionBidsMap.set(bid.auction_id, bid);
      }
    });

    const latestBids = Array.from(auctionBidsMap.values());

    // Enhance with winning/outbid status
    const bidsWithStatus = latestBids.map((bid: any) => ({
      ...bid,
      isWinning:
        bid.auction?.highest_bidder_id === user?.uid &&
        bid.auction?.status === "live",
      isOutbid:
        bid.auction?.highest_bidder_id !== user?.uid &&
        bid.auction?.status === "live",
    }));

    // Sort by created_at descending
    bidsWithStatus.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    return bidsWithStatus;
  }, [user?.uid]);

  useEffect(() => {
    if (user) {
      execute(loadBids);
    }
  }, [user, execute, loadBids]);

  // Safe access to bids array
  const bidsList = bids || [];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Please log in to view your bids
          </h3>
        </div>
      </div>
    );
  }

  if (loading) {
    return <PageState.Loading message="Loading your bids..." />;
  }

  if (error) {
    return (
      <PageState.Error
        message={error.message}
        onRetry={() => execute(loadBids)}
      />
    );
  }

  const winningBids = bidsList.filter((b) => b.isWinning);
  const outbidBids = bidsList.filter((b) => b.isOutbid);
  const endedBids = bidsList.filter((b) => b.auction?.status === "ended");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Gavel className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Bids
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Track all your auction bids in one place
          </p>
        </div>

        {/* Stats */}
        {bidsList.length > 0 && (
          <StatsCardGrid columns={4} className="mb-8">
            <StatsCard
              title="Total Bids"
              value={bidsList.length}
              icon={<Gavel className="w-5 h-5 text-blue-600" />}
            />
            <StatsCard
              title="Winning"
              value={winningBids.length}
              icon={<Trophy className="w-5 h-5 text-green-600" />}
            />
            <StatsCard
              title="Outbid"
              value={outbidBids.length}
              icon={<TrendingUp className="w-5 h-5 text-red-600" />}
            />
            <StatsCard
              title="Ended"
              value={endedBids.length}
              icon={<Gavel className="w-5 h-5 text-gray-600" />}
            />
          </StatsCardGrid>
        )}

        {/* Bids List */}
        {bidsList.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <Gavel className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No bids yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start bidding on auctions to see your activity here
            </p>
            <Link
              href="/auctions"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Auctions
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bidsList.map((bid) => (
              <div
                key={bid.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <Link
                  href={`/auctions/${bid.auction?.slug || bid.auction_id}`}
                  className="block p-6"
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="relative w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                      {bid.auction?.images?.[0] ? (
                        <Image
                          src={bid.auction.images[0]}
                          alt={bid.auction.name || "Auction"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <Gavel size={32} />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {bid.auction?.name || "Auction #" + bid.auction_id}
                        </h3>

                        {/* Status Badge */}
                        {bid.isWinning && (
                          <span className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0">
                            <TrendingUp size={14} />
                            Winning
                          </span>
                        )}
                        {bid.isOutbid && (
                          <span className="flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0">
                            <AlertCircle size={14} />
                            Outbid
                          </span>
                        )}
                        {bid.auction?.status === "ended" && (
                          <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0">
                            Ended
                          </span>
                        )}
                      </div>

                      {/* Bid Info */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500 dark:text-gray-400 mb-1">
                            Your Bid
                          </div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(bid.amount)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 dark:text-gray-400 mb-1">
                            Current Bid
                          </div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(
                              bid.auction?.currentBid || bid.amount,
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 dark:text-gray-400 mb-1">
                            Bid Time
                          </div>
                          <div className="text-gray-900 dark:text-gray-200">
                            {formatDate(bid.created_at, {
                              format: "short",
                              includeTime: true,
                            })}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 dark:text-gray-400 mb-1">
                            Total Bids
                          </div>
                          <div className="text-gray-900 dark:text-gray-200">
                            {bid.auction?.bidCount || 0} bids
                          </div>
                        </div>
                      </div>

                      {/* Auto Bid Indicator */}
                      {bid.is_auto_bid && (
                        <div className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600">
                          <Trophy size={12} />
                          Auto-bid
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
