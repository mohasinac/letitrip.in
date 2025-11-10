"use client";

import { useState, useEffect } from "react";
import { Trophy, AlertCircle, Loader2, Package, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { auctionsService } from "@/services/auctions.service";
import Link from "next/link";
import Image from "next/image";

interface WonAuction {
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
  order_id?: string;
  order_status?: string;
  shop?: {
    id: string;
    name: string;
    logo?: string;
  };
}

export default function WonAuctionsPage() {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState<WonAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadWonAuctions();
    }
  }, [user]);

  const loadWonAuctions = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await auctionsService.getWonAuctions();
      setAuctions(data || []);
    } catch (error) {
      console.error("Failed to load won auctions:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load won auctions"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Please log in to view your won auctions
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
            onClick={loadWonAuctions}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalWinnings = auctions.reduce(
    (sum, auction) => sum + auction.currentBid,
    0
  );
  const pendingPayment = auctions.filter(
    (a) => !a.order_id || a.order_status === "pending"
  );
  const completedOrders = auctions.filter(
    (a) => a.order_id && a.order_status === "completed"
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-900">Won Auctions</h1>
          </div>
          <p className="text-gray-600">
            Congratulations on winning these auctions! Complete payment to
            receive your items.
          </p>
        </div>

        {/* Stats */}
        {auctions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Won</div>
                <div className="text-2xl font-bold text-gray-900">
                  {auctions.length}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Value</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalWinnings)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">
                  Pending Payment
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {pendingPayment.length}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Completed</div>
                <div className="text-2xl font-bold text-blue-600">
                  {completedOrders.length}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Won Auctions List */}
        {auctions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No won auctions yet
            </h3>
            <p className="text-gray-600 mb-6">
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
            {auctions.map((auction) => {
              const hasPendingPayment =
                !auction.order_id || auction.order_status === "pending";
              const hasOrder = !!auction.order_id;

              return (
                <div
                  key={auction.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {auction.images?.[0] ? (
                          <Image
                            src={auction.images[0]}
                            alt={auction.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
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
                              href={`/auctions/${auction.slug}`}
                              className="text-xl font-semibold text-gray-900 hover:text-blue-600 line-clamp-2"
                            >
                              {auction.name}
                            </Link>
                            {auction.shop && (
                              <div className="flex items-center gap-2 mt-1">
                                {auction.shop.logo && (
                                  <Image
                                    src={auction.shop.logo}
                                    alt={auction.shop.name}
                                    width={20}
                                    height={20}
                                    className="rounded-full"
                                  />
                                )}
                                <span className="text-sm text-gray-600">
                                  {auction.shop.name}
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
                            <div className="text-gray-500 mb-1">
                              Winning Bid
                            </div>
                            <div className="font-bold text-green-600 text-lg">
                              {formatCurrency(auction.currentBid)}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500 mb-1">Total Bids</div>
                            <div className="font-semibold text-gray-900">
                              {auction.bidCount} bids
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500 mb-1">Ended On</div>
                            <div className="text-gray-900">
                              {formatDate(auction.endTime, { format: "short" })}
                            </div>
                          </div>
                          {hasOrder && auction.order_id && (
                            <div>
                              <div className="text-gray-500 mb-1">Order ID</div>
                              <Link
                                href={`/user/orders/${auction.order_id}`}
                                className="text-blue-600 hover:underline font-medium"
                              >
                                #{auction.order_id}
                              </Link>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3">
                          <Link
                            href={`/auctions/${auction.slug}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
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

                          {hasOrder && auction.order_id && (
                            <>
                              <Link
                                href={`/user/orders/${auction.order_id}`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                              >
                                <Package size={16} />
                                Track Order
                              </Link>
                              <Link
                                href={`/api/orders/${auction.order_id}/invoice`}
                                target="_blank"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
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
