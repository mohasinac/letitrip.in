"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ClockIcon,
  EyeIcon,
  HeartIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CurrencyRupeeIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

interface Auction {
  id: string;
  title: string;
  currentBid: number;
  startingBid: number;
  bidCount: number;
  endTime: string;
  status: "upcoming" | "live" | "ended";
  category: string;
  images: string[];
  views: number;
  watchlistCount: number;
  description: string;
  features: string[];
  tags: string[];
  createdAt: string;
  reservePrice?: number;
  buyNowPrice?: number;
}

interface Seller {
  id: string;
  name: string;
  businessName: string;
  email: string;
  verified: boolean;
  rating: number;
  totalAuctions: number;
  successfulAuctions: number;
  joinedDate: string;
  description: string;
  location: string;
  avatar?: string;
}

export default function SellerStoreAuctionsPage() {
  const { sellerId } = useParams();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("ending_soon");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);

  const fetchSellerData = async () => {
    setLoading(true);
    try {
      // Fetch seller info
      const sellerResponse = await fetch(`/api/sellers/${sellerId}`);
      if (sellerResponse.ok) {
        const sellerData = await sellerResponse.json();
        setSeller(sellerData);
      }

      // Fetch auctions
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        search,
        category,
        status,
        sort,
      });

      const auctionsResponse = await fetch(
        `/api/sellers/${sellerId}/auctions?${params}`
      );
      if (auctionsResponse.ok) {
        const data = await auctionsResponse.json();
        setAuctions(data.auctions);
        setTotalPages(data.pagination.totalPages);
        setCategories(data.categories);
      } else {
        setAuctions([]);
      }
    } catch (error) {
      console.error("Failed to fetch seller data:", error);
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sellerId) {
      const debounceTimer = setTimeout(() => {
        fetchSellerData();
      }, 300);

      return () => clearTimeout(debounceTimer);
    }
  }, [sellerId, search, category, status, sort, page]);

  const toggleWatchlist = async (auctionId: string) => {
    try {
      const response = await fetch("/api/user/watchlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ auctionId }),
      });

      if (response.ok) {
        setWatchlist((prev) =>
          prev.includes(auctionId)
            ? prev.filter((id) => id !== auctionId)
            : [...prev, auctionId]
        );
      }
    } catch (error) {
      console.error("Failed to toggle watchlist:", error);
    }
  };

  const formatTimeRemaining = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-green-100 text-green-800";
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "ended":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const applyFilters = () => {
    setPage(1);
    fetchSellerData();
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setStatus("");
    setSort("ending_soon");
    setPage(1);
  };

  if (loading && !seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Seller Not Found
          </h1>
          <p className="text-gray-600">
            The seller you're looking for doesn't exist.
          </p>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 mt-4 inline-block"
          >
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Seller Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              {seller.avatar ? (
                <Image
                  src={seller.avatar}
                  alt={seller.name}
                  width={96}
                  height={96}
                  className="rounded-full"
                />
              ) : (
                <span className="text-2xl font-bold text-gray-600">
                  {seller.name.charAt(0)}
                </span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {seller.businessName || seller.name} - Auctions
                </h1>
                {seller.verified && (
                  <CheckCircleIcon className="w-6 h-6 text-green-500" />
                )}
              </div>

              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-gray-500">
                  {seller.totalAuctions} total auctions
                </span>
                <span className="text-sm text-gray-500">
                  {seller.successfulAuctions} successful
                </span>
                <span className="text-sm text-gray-500">{seller.location}</span>
              </div>

              {seller.description && (
                <p className="mt-2 text-gray-600">{seller.description}</p>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href={`/store/${sellerId}`}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                View Products
              </Link>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search auctions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filters
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">All Statuses</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="live">Live</option>
                  <option value="ended">Ended</option>
                </select>

                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="ending_soon">Ending Soon</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest_bid">Highest Bid</option>
                  <option value="most_bids">Most Bids</option>
                  <option value="most_watched">Most Watched</option>
                </select>

                <div className="flex space-x-2">
                  <button
                    onClick={applyFilters}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Apply
                  </button>
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Auctions Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading auctions...</p>
          </div>
        ) : auctions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No auctions found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {auctions.map((auction) => (
                <div
                  key={auction.id}
                  className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative">
                    <Link href={`/auctions/${auction.id}`}>
                      <Image
                        src={auction.images?.[0] || "/images/placeholder.jpg"}
                        alt={auction.title}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-200"
                      />
                    </Link>

                    <button
                      onClick={() => toggleWatchlist(auction.id)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                    >
                      {watchlist.includes(auction.id) ? (
                        <HeartSolid className="w-5 h-5 text-red-500" />
                      ) : (
                        <HeartIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    <div className="absolute top-2 left-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          auction.status
                        )}`}
                      >
                        {auction.status}
                      </span>
                    </div>

                    {auction.status === "live" && (
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                          <ClockIcon className="w-3 h-3 inline mr-1" />
                          {formatTimeRemaining(auction.endTime)}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <Link href={`/auctions/${auction.id}`}>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600">
                        {auction.title}
                      </h3>
                    </Link>

                    <div className="flex items-center space-x-1 mb-2">
                      <EyeIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {auction.views} views
                      </span>
                      <span className="text-sm text-gray-400">•</span>
                      <HeartIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {auction.watchlistCount} watching
                      </span>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Current Bid:
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          ₹{auction.currentBid.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          Starting: ₹{auction.startingBid.toLocaleString()}
                        </span>
                        <span className="text-gray-600">
                          {auction.bidCount} bids
                        </span>
                      </div>

                      {auction.buyNowPrice && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Buy Now:</span>
                          <span className="font-medium text-blue-600">
                            ₹{auction.buyNowPrice.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-500">
                        {auction.category}
                      </span>
                      {auction.status !== "ended" && (
                        <span className="text-xs text-gray-600">
                          {formatTimeRemaining(auction.endTime)}
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/auctions/${auction.id}`}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <CurrencyRupeeIcon className="w-4 h-4 mr-2" />
                      {auction.status === "live"
                        ? "Place Bid"
                        : auction.status === "upcoming"
                        ? "View Details"
                        : "View Results"}
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-8 space-x-4">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
