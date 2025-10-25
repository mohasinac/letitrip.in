"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  StarIcon,
  ShoppingBagIcon,
  UsersIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  CalendarDaysIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

interface Seller {
  id: string;
  name: string;
  businessName?: string;
  storeName?: string;
  displayName: string;
  storeStatus: "live" | "maintenance" | "offline";
  storeDescription?: string;
  isFeatured: boolean;
  email: string;
  verified: boolean;
  rating: number;
  totalProducts: number;
  totalSales: number;
  joinedDate: string;
  description: string;
  location: string;
  avatar?: string;
  category: string;
  isActive: boolean;
  lastSeen: string;
}

export default function StoresPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [storeStatus, setStoreStatus] = useState("");
  const [sort, setSort] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    "All",
    "Official",
    "Collectibles",
    "Tournament",
    "General",
    "Vintage",
    "Custom",
  ];

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        search,
        category: category === "All" ? "" : category,
        storeStatus,
        sort,
      });

      const response = await fetch(`/api/stores?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSellers(data.sellers);
        setTotalPages(data.pagination.totalPages);
      } else {
        setSellers([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to fetch sellers:", error);
      setSellers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchSellers();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [search, category, storeStatus, sort, page]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const getActiveStatus = (seller: Seller) => {
    if (!seller.isActive) return "Inactive";

    const lastSeen = new Date(seller.lastSeen);
    const now = new Date();
    const diffHours = (now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60);

    if (diffHours < 1) return "Online";
    if (diffHours < 24) return "Active today";
    if (diffHours < 168) return "Active this week";
    return "Inactive";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Online":
        return "text-green-600 bg-green-100";
      case "Active today":
        return "text-blue-600 bg-blue-100";
      case "Active this week":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Stores</h1>
          <p className="text-gray-600">
            Discover amazing stores from verified sellers around the world
          </p>
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
                  placeholder="Search stores, locations, or products..."
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat === "All" ? "" : cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <select
                  value={storeStatus}
                  onChange={(e) => setStoreStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">All Stores</option>
                  <option value="live">Live Stores</option>
                  <option value="maintenance">Under Maintenance</option>
                  <option value="offline">Offline Stores</option>
                </select>

                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="sales">Most Sales</option>
                  <option value="products">Most Products</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Sellers Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading stores...</p>
          </div>
        ) : sellers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No stores found matching your criteria
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sellers.map((seller) => {
                const status = getActiveStatus(seller);
                return (
                  <div
                    key={seller.id}
                    className={`bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${
                      seller.isFeatured
                        ? "ring-2 ring-yellow-400 ring-opacity-50"
                        : ""
                    }`}
                  >
                    {seller.isFeatured && (
                      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-medium px-3 py-1 flex items-center">
                        <SparklesIcon className="w-3 h-3 mr-1" />
                        Featured Store
                      </div>
                    )}
                    <div className="p-6">
                      {/* Seller Header */}
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          {seller.avatar ? (
                            <Image
                              src={seller.avatar}
                              alt={seller.displayName}
                              width={64}
                              height={64}
                              className="rounded-full"
                            />
                          ) : (
                            <span className="text-xl font-bold text-gray-600">
                              {seller.displayName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            {seller.isFeatured && (
                              <SparklesIcon className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                            )}
                            <h3 className="font-semibold text-gray-900 truncate">
                              {seller.displayName}
                            </h3>
                            {seller.verified && (
                              <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                            )}
                          </div>

                          {/* Store status and name info */}
                          <div className="flex items-center space-x-2 mb-2">
                            {seller.storeName && (
                              <span className="text-xs text-blue-600 font-medium">
                                {seller.storeName}
                              </span>
                            )}
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                seller.storeStatus === "live"
                                  ? "bg-green-100 text-green-800"
                                  : seller.storeStatus === "maintenance"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {seller.storeStatus === "live"
                                ? "🟢 Live"
                                : seller.storeStatus === "maintenance"
                                ? "🟡 Maintenance"
                                : "🔴 Offline"}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1 mb-2">
                            <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">
                              {seller.rating}
                            </span>
                            <span className="text-sm text-gray-500">
                              ({seller.totalSales} sales)
                            </span>
                          </div>

                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {seller.storeDescription || seller.description}
                      </p>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center text-blue-600 mb-1">
                            <ShoppingBagIcon className="w-4 h-4 mr-1" />
                            <span className="font-semibold">
                              {seller.totalProducts}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">Products</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center text-green-600 mb-1">
                            <UsersIcon className="w-4 h-4 mr-1" />
                            <span className="font-semibold">
                              {seller.totalSales}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">Sales</p>
                        </div>
                      </div>

                      {/* Location and Date */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <MapPinIcon className="w-4 h-4 mr-1" />
                          <span>{seller.location}</span>
                        </div>
                        <div className="flex items-center">
                          <CalendarDaysIcon className="w-4 h-4 mr-1" />
                          <span>Since {formatDate(seller.joinedDate)}</span>
                        </div>
                      </div>

                      {/* Category */}
                      <div className="mb-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {seller.category}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Link
                          href={`/store/${seller.id}`}
                          className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Visit Store
                        </Link>
                        <Link
                          href={`/store/${seller.id}/products`}
                          className="flex-1 border border-gray-300 text-gray-700 text-center py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          View Products
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
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
