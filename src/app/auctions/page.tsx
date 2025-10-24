"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

import { useAuctions } from "@/hooks/useFirebase";

type AuctionStatus = "live" | "upcoming" | "ended";

export default function AuctionsPage() {
  const [filter, setFilter] = useState<AuctionStatus | "all">("all");

  // Fetch auctions from Firebase with real-time updates
  const {
    auctions: allAuctions,
    loading,
    error,
  } = useAuctions({
    status: filter === "all" ? undefined : filter,
    limit: 50,
  });

  // Filter auctions based on status
  const auctions = useMemo(() => {
    if (filter === "all") return allAuctions;
    return allAuctions.filter((auction) => auction.status === filter);
  }, [allAuctions, filter]);

  // Mock auction data fallback
  const mockAuctions = [
    {
      id: "1",
      title: "Rare Vintage Beyblade Metal Series",
      description: "Limited edition metal fusion beyblade from 2010 series",
      image: "/images/auction-1.jpg",
      currentBid: 2500,
      startingBid: 1000,
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      status: "live",
      bidCount: 15,
      isWatching: true,
    },
    {
      id: "2",
      title: "Professional Tournament Stadium",
      description: "Official tournament grade stadium with battle accessories",
      image: "/images/auction-2.jpg",
      currentBid: 0,
      startingBid: 3000,
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      status: "upcoming",
      bidCount: 0,
    },
    {
      id: "3",
      title: "Complete Launcher Collection Set",
      description: "Set of 5 different launcher types with grips",
      image: "/images/auction-3.jpg",
      currentBid: 1800,
      startingBid: 800,
      endTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      status: "ended",
      bidCount: 23,
    },
  ];

  const filteredAuctions = auctions.filter(
    (auction) => filter === "all" || auction.status === filter
  );

  const getTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getStatusBadge = (status: AuctionStatus) => {
    switch (status) {
      case "live":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full animate-pulse">
            🔴 LIVE
          </span>
        );
      case "upcoming":
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            📅 Upcoming
          </span>
        );
      case "ended":
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
            ⏹️ Ended
          </span>
        );
    }
  };

  return (
    
      <main className="flex-1 bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="container py-16 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              🎯 Live Auctions
            </h1>
            <p className="text-lg md:text-xl text-purple-100 max-w-2xl mx-auto">
              Bid on exclusive and rare items. Find unique collectibles and get
              amazing deals!
            </p>
          </div>
        </div>

        <div className="container py-8">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={() => setFilter("all")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition ${
                filter === "all"
                  ? "bg-primary text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              All Auctions ({auctions.length})
            </button>
            <button
              onClick={() => setFilter("live")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition ${
                filter === "live"
                  ? "bg-primary text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Live ({auctions.filter((a) => a.status === "live").length})
            </button>
            <button
              onClick={() => setFilter("upcoming")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition ${
                filter === "upcoming"
                  ? "bg-primary text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Upcoming ({auctions.filter((a) => a.status === "upcoming").length}
              )
            </button>
            <button
              onClick={() => setFilter("ended")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition ${
                filter === "ended"
                  ? "bg-primary text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Ended ({auctions.filter((a) => a.status === "ended").length})
            </button>
          </div>

          {/* Auction Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <p className="text-red-500 mb-4">{error}</p>
                <p className="text-muted-foreground">
                  Showing mock data as fallback
                </p>
              </div>
            ) : filteredAuctions.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">
                  No auctions found for the selected filter.
                </p>
              </div>
            ) : (
              filteredAuctions.map((auction) => (
                <Link
                  key={auction.id}
                  href={`/auctions/${auction.id}`}
                  className="card overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  {/* Image */}
                  <div className="aspect-square bg-gray-100 overflow-hidden relative">
                    <img
                      src={auction.images[0] || "/placeholder-auction.jpg"}
                      alt={auction.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-4 left-4">
                      {getStatusBadge(auction.status)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                      {auction.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {auction.description}
                    </p>

                    {/* Bid Info */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {auction.status === "upcoming"
                            ? "Starting bid"
                            : "Current bid"}
                        </span>
                        <span className="font-bold text-lg">
                          ₹
                          {(
                            auction.currentBid || auction.startingBid
                          ).toLocaleString("en-IN")}
                        </span>
                      </div>

                      {auction.status === "live" && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Time left
                          </span>
                          <span className="font-medium text-red-600">
                            {getTimeRemaining(auction.endTime)}
                          </span>
                        </div>
                      )}

                      {auction.status === "upcoming" && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Starts in
                          </span>
                          <span className="font-medium text-blue-600">
                            {getTimeRemaining(auction.endTime)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {auction.bidCount} bids
                        </span>
                        {auction.status === "live" && (
                          <span className="text-sm font-medium text-green-600">
                            🔥 Active bidding
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-4">
                      {auction.status === "live" && (
                        <button className="btn btn-primary w-full">
                          Place Bid
                        </button>
                      )}
                      {auction.status === "upcoming" && (
                        <button className="btn btn-outline w-full">
                          Watch Auction
                        </button>
                      )}
                      {auction.status === "ended" && (
                        <button className="btn btn-secondary w-full" disabled>
                          Auction Ended
                        </button>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {filteredAuctions.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">No auctions found</h3>
              <p className="text-muted-foreground mb-6">
                No {filter !== "all" && filter} auctions available at the
                moment.
              </p>
              <button
                onClick={() => setFilter("all")}
                className="btn btn-primary"
              >
                View All Auctions
              </button>
            </div>
          )}
        </div>

        {/* How It Works */}
        <section className="py-16 bg-white">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">
              How Auctions Work
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="font-semibold mb-2">Browse & Watch</h3>
                <p className="text-sm text-muted-foreground">
                  Find interesting items and add them to your watchlist
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="font-semibold mb-2">Place Bids</h3>
                <p className="text-sm text-muted-foreground">
                  Bid on live auctions and compete with other buyers
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="font-semibold mb-2">Win & Buy</h3>
                <p className="text-sm text-muted-foreground">
                  Win the auction and get your item delivered
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    
  );
}
