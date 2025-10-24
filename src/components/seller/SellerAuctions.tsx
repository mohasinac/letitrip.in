"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  ClockIcon,
  EyeIcon,
  CurrencyDollarIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

interface SellerAuction {
  id: string;
  title: string;
  currentBid: number;
  startingBid: number;
  bidCount: number;
  endTime: string;
  status: "upcoming" | "live" | "ended";
  image: string;
  views: number;
  watchlistCount: number;
}

export default function SellerAuctions() {
  const [auctions, setAuctions] = useState<SellerAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSellerAuctions = async () => {
      if (!user?.uid) return;

      try {
        const response = await fetch(
          `/api/seller/auctions?sellerId=${user.uid}&limit=6`
        );
        if (response.ok) {
          const data = await response.json();
          setAuctions(data);
        } else {
          setAuctions([]);
        }
      } catch (error) {
        console.error("Failed to fetch seller auctions:", error);
        setAuctions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerAuctions();
  }, [user]);

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

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Auctions
          </h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Recent Auctions</h3>
        <div className="flex items-center space-x-2">
          <Link
            href="/seller/auctions/new"
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            Create
          </Link>
          <Link
            href="/seller/auctions"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View All
          </Link>
        </div>
      </div>

      <div className="p-6">
        {auctions.length === 0 ? (
          <div className="text-center py-8">
            <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No auctions created yet</p>
            <Link
              href="/seller/auctions/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Your First Auction
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {auctions.map((auction) => (
              <div
                key={auction.id}
                className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <img
                  src={auction.image}
                  alt={auction.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {auction.title}
                  </h4>
                  <div className="flex items-center space-x-4 mt-1">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        auction.status
                      )}`}
                    >
                      {auction.status}
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                      <CurrencyDollarIcon className="w-4 h-4 mr-1" />₹
                      {auction.currentBid.toLocaleString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <EyeIcon className="w-4 h-4 mr-1" />
                      {auction.views}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {auction.bidCount} bids
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTimeRemaining(auction.endTime)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
