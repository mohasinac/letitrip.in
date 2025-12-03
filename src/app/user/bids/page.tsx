"use client";

import { useState, useEffect, useCallback } from "react";
import { Gavel, AlertCircle, Loader2, TrendingUp, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { auctionsService } from "@/services/auctions.service";
import { useLoadingState } from "@/hooks/useLoadingState";
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Please log in to view your bids
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
          <p className="mt-1 text-sm text-gray-500">{error.message}</p>
          <button
            onClick={() => execute(loadBids)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const winningBids = bidsList.filter((b) => b.isWinning);
  const outbidBids = bidsList.filter((b) => b.isOutbid);
  const endedBids = bidsList.filter((b) => b.auction?.status === "ended");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Gavel className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">My Bids</h1>
          </div>
          <p className="text-gray-600">
            Track all your auction bids in one place
          </p>
        </div>

        {/* Stats */}
        {bidsList.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Bids</div>
                <div className="text-2xl font-bold text-gray-900">
                  {bidsList.length}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Winning</div>
                <div className="text-2xl font-bold text-green-600">
                  {winningBids.length}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Outbid</div>
                <div className="text-2xl font-bold text-red-600">
                  {outbidBids.length}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Ended</div>
                <div className="text-2xl font-bold text-gray-600">
                  {endedBids.length}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bids List */}
        {bidsList.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Gavel className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No bids yet
            </h3>
            <p className="text-gray-600 mb-6">
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
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <Link
                  href={`/auctions/${bid.auction?.slug || bid.auction_id}`}
                  className="block p-6"
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {bid.auction?.name || "Auction #" + bid.auction_id}
                        </h3>

                        {/* Status Badge */}
                        {bid.isWinning && (
                          <span className="flex items-center gap-1 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0">
                            <TrendingUp size={14} />
                            Winning
                          </span>
                        )}
                        {bid.isOutbid && (
                          <span className="flex items-center gap-1 bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0">
                            <AlertCircle size={14} />
                            Outbid
                          </span>
                        )}
                        {bid.auction?.status === "ended" && (
                          <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0">
                            Ended
                          </span>
                        )}
                      </div>

                      {/* Bid Info */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500 mb-1">Your Bid</div>
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(bid.amount)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Current Bid</div>
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(
                              bid.auction?.currentBid || bid.amount,
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Bid Time</div>
                          <div className="text-gray-900">
                            {formatDate(bid.created_at, {
                              format: "short",
                              includeTime: true,
                            })}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Total Bids</div>
                          <div className="text-gray-900">
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
