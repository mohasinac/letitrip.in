"use client";

import { useEffect, useCallback } from "react";
import {
  Trophy,
  AlertCircle,
  Loader2,
  Package,
  Download,
  DollarSign,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { auctionsService } from "@/services/auctions.service";
import { useLoadingState } from "@/hooks/useLoadingState";
import { PageState } from "@/components/common/PageState";
import { StatsCard, StatsCardGrid } from "@/components/common/StatsCard";
import Link from "next/link";
import Image from "next/image";
import type { AuctionCardFE } from "@/types/frontend/auction.types";

export default function WonAuctionsPage() {
  const { user } = useAuth();
  const {
    data: auctions,
    isLoading: loading,
    error,
    execute,
    retry,
  } = useLoadingState<AuctionCardFE[]>({ initialData: [] });

  const loadWonAuctions = useCallback(async () => {
    const data = await auctionsService.getWonAuctions();
    return data || [];
  }, []);

  useEffect(() => {
    if (user) {
      execute(loadWonAuctions);
    }
  }, [user, execute, loadWonAuctions]);

  // Safe access to auctions array
  const auctionsList = auctions || [];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Please log in to view your won auctions
          </h3>
        </div>
      </div>
    );
  }

  if (loading) {
    return <PageState.Loading message="Loading won auctions..." />;
  }

  if (error) {
    return <PageState.Error message={error.message} onRetry={retry} />;
  }

  const totalWinnings = auctionsList.reduce(
    (sum, auction) => sum + (auction.currentBid || 0),
    0
  );
  const pendingPayment = auctionsList.filter(
    (a) => !(a as any).order_id || (a as any).order_status === "pending"
  );
  const completedOrders = auctionsList.filter(
    (a) => (a as any).order_id && (a as any).order_status === "completed"
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Won Auctions
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Congratulations on winning these auctions! Complete payment to
            receive your items.
          </p>
        </div>

        {/* Stats */}
        {auctionsList.length > 0 && (
          <StatsCardGrid columns={4} className="mb-8">
            <StatsCard
              title="Total Won"
              value={auctionsList.length}
              icon={<Trophy className="w-5 h-5 text-yellow-500" />}
            />
            <StatsCard
              title="Total Value"
              value={formatCurrency(totalWinnings)}
              icon={<DollarSign className="w-5 h-5 text-green-600" />}
            />
            <StatsCard
              title="Pending Payment"
              value={pendingPayment.length}
              icon={<Clock className="w-5 h-5 text-orange-600" />}
            />
            <StatsCard
              title="Completed"
              value={completedOrders.length}
              icon={<CheckCircle className="w-5 h-5 text-blue-600" />}
            />
          </StatsCardGrid>
        )}

        {/* Won Auctions List */}
        {auctionsList.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <Trophy className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No won auctions yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Keep bidding on auctions to win amazing items!
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
            {auctionsList.map((auction) => {
              const hasPendingPayment =
                !(auction as any).order_id ||
                (auction as any).order_status === "pending";
              const hasOrder = !!(auction as any).order_id;

              return (
                <div
                  key={auction.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="relative w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        {[auction.productImage]?.[0] ? (
                          <Image
                            src={auction.productImage}
                            alt={auction.productName || ""}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                            <Trophy size={40} />
                          </div>
                        )}
                        {/* Winner Badge */}
                        <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                          WON
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/auctions/${auction.productSlug}`}
                              className="text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2"
                            >
                              {auction.productName}
                            </Link>
                            {(auction as any).shop && (
                              <div className="flex items-center gap-2 mt-1">
                                {(auction as any).shop.logo && (
                                  <Image
                                    src={(auction as any).shop.logo}
                                    alt={(auction as any).shop.name}
                                    width={20}
                                    height={20}
                                    className="rounded-full"
                                  />
                                )}
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {(auction as any).shop.name}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Order Status Badge */}
                          {hasPendingPayment ? (
                            <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0">
                              Payment Pending
                            </span>
                          ) : (
                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0">
                              Order Placed
                            </span>
                          )}
                        </div>

                        {/* Auction Details */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-sm">
                          <div>
                            <div className="text-gray-500 dark:text-gray-400 mb-1">
                              Winning Bid
                            </div>
                            <div className="font-bold text-green-600 text-lg">
                              {formatCurrency(auction.currentBid || 0)}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500 dark:text-gray-400 mb-1">
                              Total Bids
                            </div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {auction.bidCount} bids
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500 dark:text-gray-400 mb-1">
                              Ended On
                            </div>
                            <div className="text-gray-900 dark:text-white">
                              {formatDate(auction.endTime, { format: "short" })}
                            </div>
                          </div>
                          {hasOrder && (auction as any).order_id && (
                            <div>
                              <div className="text-gray-500 dark:text-gray-400 mb-1">
                                Order ID
                              </div>
                              <Link
                                href={`/user/orders/${
                                  (auction as any).order_id
                                }`}
                                className="text-blue-600 hover:underline font-medium"
                              >
                                #{(auction as any).order_id}
                              </Link>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3">
                          <Link
                            href={`/auctions/${auction.slug}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm font-medium"
                          >
                            View Details
                          </Link>

                          {hasPendingPayment && (
                            <Link
                              href={`/checkout?auction_id=${auction.id}`}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                            >
                              <Package size={16} />
                              Complete Payment
                            </Link>
                          )}

                          {hasOrder && (auction as any).order_id && (
                            <>
                              <Link
                                href={`/user/orders/${
                                  (auction as any).order_id
                                }`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                              >
                                <Package size={16} />
                                Track Order
                              </Link>
                              <Link
                                href={`/api/orders/${
                                  (auction as any).order_id
                                }/invoice`}
                                target="_blank"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm font-medium"
                              >
                                <Download size={16} />
                                Download Invoice
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
