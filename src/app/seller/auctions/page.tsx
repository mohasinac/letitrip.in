"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Gavel,
  Plus,
  Loader2,
  Clock,
  Zap,
  Archive,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/common/EmptyState";
import { auctionsService } from "@/services/auctions.service";
import type { Auction, AuctionStatus } from "@/types";
import { formatDistanceToNow } from "date-fns";

export default function SellerAuctionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState<string>("");

  const status = searchParams.get("status") as AuctionStatus | null;

  useEffect(() => {
    loadAuctions();
  }, [status, selectedShop]);

  const loadAuctions = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (status) filters.status = status;
      if (selectedShop) filters.shopId = selectedShop;

      const response = await auctionsService.list(filters);
      setAuctions(response.data || []);
    } catch (error) {
      console.error("Failed to load auctions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this auction?")) return;

    try {
      await auctionsService.delete(id);
      loadAuctions();
    } catch (error) {
      console.error("Failed to delete auction:", error);
      alert("Failed to delete auction");
    }
  };

  const getStatusBadge = (status: AuctionStatus) => {
    const styles = {
      draft: "bg-gray-100 text-gray-800",
      scheduled: "bg-blue-100 text-blue-800",
      live: "bg-green-100 text-green-800",
      ended: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
          styles[status] || styles.draft
        }`}
      >
        {status}
      </span>
    );
  };

  const stats = {
    total: auctions.length,
    live: auctions.filter((a) => a.status === "live").length,
    scheduled: auctions.filter((a) => a.status === "scheduled").length,
    ended: auctions.filter((a) => a.status === "ended").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Auctions</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your auction listings
          </p>
        </div>
        <Link
          href="/seller/auctions/create"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Create Auction
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Auctions</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {stats.total}
              </p>
            </div>
            <Gavel className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Live Auctions</p>
              <p className="mt-1 text-2xl font-bold text-green-600">
                {stats.live}
              </p>
            </div>
            <Zap className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="mt-1 text-2xl font-bold text-blue-600">
                {stats.scheduled}
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ended</p>
              <p className="mt-1 text-2xl font-bold text-gray-600">
                {stats.ended}
              </p>
            </div>
            <Archive className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={status || ""}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams);
              if (e.target.value) {
                params.set("status", e.target.value);
              } else {
                params.delete("status");
              }
              router.push(`/seller/auctions?${params.toString()}`);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live</option>
            <option value="ended">Ended</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Auctions Grid */}
      {auctions.length === 0 ? (
        <EmptyState
          title="No auctions yet"
          description="Create your first auction to start bidding"
          action={{
            label: "Create Auction",
            onClick: () => router.push("/seller/auctions/create"),
          }}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {auctions.map((auction) => (
            <div
              key={auction.id}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white hover:shadow-lg transition-shadow"
            >
              {auction.images && auction.images[0] && (
                <div className="aspect-video w-full overflow-hidden bg-gray-100">
                  <img
                    src={auction.images[0]}
                    alt={auction.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-gray-900 line-clamp-2">
                    {auction.name}
                  </h3>
                  {getStatusBadge(auction.status)}
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Current Bid:</span>
                    <span className="font-semibold text-gray-900">
                      ₹{auction.currentBid.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Bids:</span>
                    <span className="text-gray-900">{auction.bidCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Ends:</span>
                    <span className="text-gray-900">
                      {auction.status === "live"
                        ? formatDistanceToNow(new Date(auction.endTime), {
                            addSuffix: true,
                          })
                        : new Date(auction.endTime).toLocaleDateString()}
                    </span>
                  </div>
                  {auction.isFeatured && (
                    <div className="flex items-center gap-1 text-sm text-yellow-600">
                      <span>★</span>
                      <span>Featured</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/auctions/${auction.slug}`}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Link>
                  <Link
                    href={`/seller/auctions/${auction.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(auction.id)}
                    className="rounded-lg border border-red-300 px-3 py-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
