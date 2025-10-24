"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

interface Auction {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    images: Array<{ url: string; alt: string }>;
    category: string;
  };
  title: string;
  description: string;
  images: string[];
  startingPrice: number;
  currentBid: number;
  reservePrice?: number;
  buyNowPrice?: number;
  startTime: string;
  endTime: string;
  status: "upcoming" | "active" | "ended" | "cancelled";
  bidCount: number;
  totalBids: number;
  leadingBidder?: string;
  createdAt: string;
  updatedAt?: string;
}

export default function SellerAuctionsPage() {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "active" | "upcoming" | "ended" | "cancelled"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAuctions = async () => {
    try {
      setLoading(true);

      if (!user) {
        console.error("No user found");
        return;
      }

      // Get Firebase ID token for authentication
      const auth = (await import("firebase/auth")).getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error("No authenticated user found");
        return;
      }

      const token = await currentUser.getIdToken();

      const params = new URLSearchParams();
      if (filter !== "all") params.append("status", filter);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(`/api/seller/auctions?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch auctions");
      }

      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        setAuctions(data);
      } else {
        throw new Error(data.error || "Failed to fetch auctions");
      }
    } catch (error) {
      console.error("Error loading auctions:", error);
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAuctions();
    }
  }, [user, filter, searchTerm]);

  const deleteAuction = async (auctionId: string) => {
    if (!confirm("Are you sure you want to delete this auction?")) {
      return;
    }

    try {
      if (!user) {
        console.error("No user found");
        return;
      }

      const auth = (await import("firebase/auth")).getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error("No authenticated user found");
        return;
      }

      const token = await currentUser.getIdToken();

      const response = await fetch(`/api/seller/auctions/${auctionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete auction");
      }

      setAuctions(auctions.filter((a) => a.id !== auctionId));
    } catch (error) {
      console.error("Error deleting auction:", error);
      alert("Failed to delete auction. Please try again.");
    }
  };

  const endAuction = async (auctionId: string) => {
    if (!confirm("Are you sure you want to end this auction early?")) {
      return;
    }

    try {
      if (!user) return;

      const auth = (await import("firebase/auth")).getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();

      const response = await fetch(`/api/seller/auctions/${auctionId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "ended" }),
      });

      if (response.ok) {
        fetchAuctions();
      }
    } catch (error) {
      console.error("Error ending auction:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      upcoming: "bg-blue-100 text-blue-800",
      ended: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles]
        }`}
      >
        {status === "active"
          ? "Live"
          : status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTimeRemaining = (endTime: string): string => {
    const now = new Date();
    const target = new Date(endTime);
    const diff = target.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const filteredAuctions = auctions.filter((auction) => {
    const matchesFilter = filter === "all" || auction.status === filter;
    const matchesSearch =
      searchTerm === "" ||
      auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auction.product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      {/* Header */}
      <div className="admin-header">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-primary">My Auctions</h1>
              <p className="mt-1 text-sm text-muted">
                Manage your auction listings and track bids
              </p>
            </div>
            <Link
              href="/seller/auctions/new"
              className="btn btn-primary transition-colors inline-flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Auction
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <input
                type="text"
                placeholder="Search auctions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Auctions</option>
                <option value="active">Live</option>
                <option value="upcoming">Upcoming</option>
                <option value="ended">Ended</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Quick Stats */}
            <div className="lg:col-span-3">
              <div className="flex items-center space-x-6 text-sm">
                <div>
                  <span className="text-gray-500">Total:</span>
                  <span className="ml-1 font-medium">{auctions.length}</span>
                </div>
                <div>
                  <span className="text-gray-500">Live:</span>
                  <span className="ml-1 font-medium text-green-600">
                    {auctions.filter((a) => a.status === "active").length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Upcoming:</span>
                  <span className="ml-1 font-medium text-blue-600">
                    {auctions.filter((a) => a.status === "upcoming").length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auctions List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-muted">Loading auctions...</p>
          </div>
        ) : filteredAuctions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <ClockIcon className="h-12 w-12 text-muted mx-auto mb-4" />
            <p className="text-muted mb-4">
              {searchTerm || filter !== "all"
                ? "No auctions match your filters."
                : auctions.length === 0
                ? "You haven't created any auctions yet."
                : "No auctions found."}
            </p>
            {auctions.length === 0 ? (
              <Link
                href="/seller/auctions/new"
                className="text-blue-600 hover:text-blue-500"
              >
                Create your first auction
              </Link>
            ) : (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilter("all");
                }}
                className="text-blue-600 hover:text-blue-500"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Auction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Bid
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bids
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time Remaining
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
                  {filteredAuctions.map((auction) => (
                    <tr key={auction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={
                              auction.images?.[0] || "/placeholder-product.jpg"
                            }
                            alt={auction.title}
                            className="w-12 h-12 object-cover rounded-lg mr-4"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {auction.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              Starting: ₹
                              {auction.startingPrice.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ₹
                          {(
                            auction.currentBid || auction.startingPrice
                          ).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {auction.bidCount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getTimeRemaining(auction.endTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(auction.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/auctions/${auction.product.slug}`}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="View auction"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          {auction.status === "upcoming" && (
                            <Link
                              href={`/seller/auctions/${auction.id}/edit`}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Edit auction"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                          )}
                          {auction.status === "active" && (
                            <button
                              onClick={() => endAuction(auction.id)}
                              className="text-yellow-600 hover:text-yellow-900 p-1"
                              title="End auction early"
                            >
                              <XCircleIcon className="h-4 w-4" />
                            </button>
                          )}
                          {(auction.status === "upcoming" ||
                            auction.status === "cancelled") && (
                            <button
                              onClick={() => deleteAuction(auction.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Delete auction"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
