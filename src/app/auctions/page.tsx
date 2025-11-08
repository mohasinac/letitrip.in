"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Gavel, Loader2, Clock, TrendingUp, Star } from "lucide-react";
import Link from "next/link";
import { CardGrid } from "@/components/cards/CardGrid";
import { EmptyState } from "@/components/common/EmptyState";
import { auctionsService } from "@/services/auctions.service";
import type { Auction, AuctionStatus } from "@/types";
import { formatDistanceToNow } from "date-fns";

export default function AuctionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  const status = searchParams.get("status") as AuctionStatus | null;
  const featured = searchParams.get("featured");

  useEffect(() => {
    loadAuctions();
  }, [status, featured]);

  const loadAuctions = async () => {
    try {
      setLoading(true);
      const filters: any = {};

      if (status) {
        filters.status = status;
      } else {
        filters.status = "live"; // Default to live auctions
      }

      if (featured === "true") {
        filters.isFeatured = true;
      }

      const response = await auctionsService.list(filters);
      setAuctions(response.data || []);
    } catch (error) {
      console.error("Failed to load auctions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours < 24) {
      return `${hours}h ${minutes}m left`;
    }

    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h left`;
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Live Auctions</h1>
        <p className="mt-2 text-gray-600">
          Bid on unique items and win great deals
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={status || "live"}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams);
              if (e.target.value && e.target.value !== "live") {
                params.set("status", e.target.value);
              } else {
                params.delete("status");
              }
              router.push(`/auctions?${params.toString()}`);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="live">Live</option>
            <option value="scheduled">Upcoming</option>
            <option value="ended">Ended</option>
          </select>
        </div>

        <button
          onClick={() => {
            const params = new URLSearchParams(searchParams);
            if (featured === "true") {
              params.delete("featured");
            } else {
              params.set("featured", "true");
            }
            router.push(`/auctions?${params.toString()}`);
          }}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
            featured === "true"
              ? "border-yellow-500 bg-yellow-50 text-yellow-700"
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Star className="h-4 w-4" />
          {featured === "true" ? "All Auctions" : "Featured Only"}
        </button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-3">
              <Gavel className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Live Auctions</p>
              <p className="text-2xl font-bold text-gray-900">
                {auctions.filter((a) => a.status === "live").length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-3">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ending Soon</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  auctions.filter((a) => {
                    const diff =
                      new Date(a.endTime).getTime() - new Date().getTime();
                    return a.status === "live" && diff < 24 * 60 * 60 * 1000;
                  }).length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-yellow-100 p-3">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Bids</p>
              <p className="text-2xl font-bold text-gray-900">
                {auctions.reduce((sum, a) => sum + a.bidCount, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Auctions Grid */}
      {auctions.length === 0 ? (
        <EmptyState
          title="No auctions found"
          description="Check back later for new auctions"
          action={{
            label: "Browse All",
            onClick: () => router.push("/auctions"),
          }}
        />
      ) : (
        <CardGrid>
          {auctions.map((auction) => (
            <Link
              key={auction.id}
              href={`/auctions/${auction.slug}`}
              className="group overflow-hidden rounded-lg border border-gray-200 bg-white hover:border-primary hover:shadow-lg transition-all"
            >
              {/* Image */}
              {auction.images && auction.images[0] && (
                <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                  <img
                    src={auction.images[0]}
                    alt={auction.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {auction.isFeatured && (
                    <div className="absolute top-2 right-2 rounded-full bg-yellow-500 px-2 py-1 text-xs font-medium text-white">
                      ★ Featured
                    </div>
                  )}
                  {auction.status === "live" && (
                    <div className="absolute top-2 left-2 rounded-full bg-green-500 px-2 py-1 text-xs font-medium text-white flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                      Live
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                  {auction.name}
                </h3>

                {/* Bid Info */}
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Bid:</span>
                    <span className="text-lg font-bold text-primary">
                      ₹{auction.currentBid.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Bids:</span>
                    <span className="font-medium text-gray-900">
                      {auction.bidCount}
                    </span>
                  </div>
                  {auction.status === "live" && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Time Left:</span>
                      <span className="font-medium text-red-600">
                        {getTimeRemaining(auction.endTime)}
                      </span>
                    </div>
                  )}
                  {auction.status === "scheduled" && (
                    <div className="text-sm text-blue-600">
                      Starts{" "}
                      {formatDistanceToNow(new Date(auction.startTime), {
                        addSuffix: true,
                      })}
                    </div>
                  )}
                </div>

                {/* CTA */}
                <button className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
                  {auction.status === "live" ? "Place Bid" : "View Details"}
                </button>
              </div>
            </Link>
          ))}
        </CardGrid>
      )}
    </div>
  );
}
