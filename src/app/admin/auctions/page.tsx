"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import RoleGuard from "@/components/auth/RoleGuard";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface Auction {
  id: string;
  title: string;
  currentBid: number;
  startingBid: number;
  bidCount: number;
  endTime: string;
  status: "upcoming" | "live" | "ended";
  category: string;
  seller: {
    id: string;
    name: string;
    email: string;
    verified: boolean;
  };
  images: string[];
  views: number;
  watchlistCount: number;
  createdAt: string;
}

interface Filters {
  categories: Array<{ id: string; name: string }>;
  statuses: string[];
}

export default function AdminAuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    statuses: [],
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        search,
        category,
        status,
        sellerId,
        sort,
      });

      const response = await fetch(`/api/admin/auctions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAuctions(data.auctions);
        setTotalPages(data.pagination.totalPages);
        setFilters(data.filters);
      } else {
        setAuctions([]);
      }
    } catch (error) {
      console.error("Failed to fetch auctions:", error);
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchAuctions();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [search, category, status, sellerId, sort, page]);

  const applyFilters = () => {
    setPage(1);
    fetchAuctions();
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setStatus("");
    setSellerId("");
    setSort("newest");
    setPage(1);
  };

  const updateAuctionStatus = async (auctionId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/admin/auctions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auctionId,
          updates: { status: newStatus },
        }),
      });

      if (response.ok) {
        fetchAuctions();
      }
    } catch (error) {
      console.error("Failed to update auction status:", error);
    }
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

  const formatTimeRemaining = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h left`;
    }

    return `${hours}h ${minutes}m left`;
  };

  return (
    <RoleGuard requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Auction Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage all auctions across the platform
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/admin/products"
                  className="text-blue-600 hover:text-blue-700 font-medium"
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
                    placeholder="Search auctions, sellers..."
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
                    {filters.categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">All Statuses</option>
                    {filters.statuses.map((stat) => (
                      <option key={stat} value={stat}>
                        {stat.charAt(0).toUpperCase() + stat.slice(1)}
                      </option>
                    ))}
                  </select>

                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="ending_soon">Ending Soon</option>
                    <option value="highest_bid">Highest Bid</option>
                    <option value="most_bids">Most Bids</option>
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Auctions
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {auctions.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Live Auctions
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {auctions.filter((a) => a.status === "live").length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {auctions.filter((a) => a.status === "upcoming").length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <XCircleIcon className="h-6 w-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ended</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {auctions.filter((a) => a.status === "ended").length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Auctions Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading auctions...</p>
              </div>
            ) : auctions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No auctions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Auction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Seller
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Bid
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bids
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time Left
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {auctions.map((auction) => (
                      <tr key={auction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={
                                auction.images?.[0] || "/images/placeholder.jpg"
                              }
                              alt={auction.title}
                              className="w-12 h-12 object-cover rounded-lg mr-4"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {auction.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {auction.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {auction.seller?.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {auction.seller?.email}
                              </div>
                            </div>
                            {auction.seller?.verified && (
                              <CheckCircleIcon className="w-4 h-4 text-green-500 ml-2" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {auction.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{auction.currentBid?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {auction.bidCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTimeRemaining(auction.endTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              auction.status
                            )}`}
                          >
                            {auction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/auctions/${auction.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() =>
                                updateAuctionStatus(
                                  auction.id,
                                  auction.status === "live" ? "ended" : "live"
                                )
                              }
                              className={`${
                                auction.status === "live"
                                  ? "text-red-600 hover:text-red-900"
                                  : "text-green-600 hover:text-green-900"
                              }`}
                            >
                              {auction.status === "live" ? (
                                <XCircleIcon className="w-4 h-4" />
                              ) : (
                                <CheckCircleIcon className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
