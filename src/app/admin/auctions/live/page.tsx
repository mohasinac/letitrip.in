"use client";

import { AdminPageHeader, LoadingSpinner, toast } from "@/components/admin";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import OptimizedImage from "@/components/common/OptimizedImage";
import { useAuth } from "@/contexts/AuthContext";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import { auctionsService } from "@/services/auctions.service";
import type { AuctionCardFE } from "@/types/frontend/auction.types";
import { AuctionStatus } from "@/types/shared/common.types";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  DollarSign,
  Eye,
  Gavel,
  Pause,
  Play,
  RefreshCw,
  Timer,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

// Stats card component
function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: { value: number; label: string };
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <div
            className={`flex items-center text-xs ${
              trend.value >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            <ArrowUpRight
              className={`h-3 w-3 ${trend.value < 0 ? "rotate-180" : ""}`}
            />
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{title}</p>
      </div>
    </div>
  );
}

// Live auction row component
function LiveAuctionRow({
  auction,
  onPause,
  onEnd,
  onView,
}: {
  auction: AuctionCardFE;
  onPause: (id: string) => void;
  onEnd: (id: string) => void;
  onView: (slug: string) => void;
}) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const end = new Date(auction.endTime).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Ended");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeLeft(`${days}d ${hours % 24}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [auction.endTime]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const isEnding = () => {
    const end = new Date(auction.endTime).getTime();
    const now = Date.now();
    const diff = end - now;
    return diff <= 60 * 60 * 1000; // Less than 1 hour
  };

  const isHotAuction = () => {
    return (auction.bidCount || 0) > 10;
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 relative">
            {auction.images && auction.images[0] ? (
              <OptimizedImage
                src={auction.images[0]}
                alt={auction.name || "Auction image"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Gavel className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <Link
              href={`/auctions/${auction.slug}`}
              className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1"
            >
              {auction.name}
            </Link>
            <div className="flex items-center gap-2 mt-0.5">
              {auction.featured && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-100 text-yellow-700">
                  Featured
                </span>
              )}
              {isHotAuction() && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700 flex items-center gap-0.5">
                  <Activity className="h-3 w-3" /> Hot
                </span>
              )}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="font-semibold text-gray-900">
          {formatPrice(
            auction.currentBid || auction.startingBid || auction.currentPrice,
          )}
        </div>
        {auction.reservePrice && (
          <div className="text-xs text-gray-500">
            Reserve: {formatPrice(auction.reservePrice)}
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <TrendingUp className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{auction.bidCount || 0}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div
          className={`flex items-center gap-1.5 ${
            isEnding() ? "text-red-600" : "text-gray-900"
          }`}
        >
          <Timer className={`h-4 w-4 ${isEnding() ? "animate-pulse" : ""}`} />
          <span className={`font-medium ${isEnding() ? "font-bold" : ""}`}>
            {timeLeft}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4 text-gray-400" />
          <span>{(auction as any).watchCount || 0}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onView(auction.slug || auction.productSlug)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onPause(auction.id!)}
            className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded"
            title="Pause"
          >
            <Pause className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEnd(auction.id!)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="End Now"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function LiveAuctionsPage() {
  const { isAdmin } = useAuth();
  const {
    isLoading: loading,
    error,
    data: auctions,
    setData: setAuctions,
    execute,
  } = useLoadingState<AuctionCardFE[]>({
    initialData: [],
    onLoadError: (error) => {
      logError(error, { component: "LiveAuctionsPage.loadLiveAuctions" });
      toast.error("Failed to load live auctions");
    },
  });
  const [refreshing, setRefreshing] = useState(false);
  const [endAuctionId, setEndAuctionId] = useState<string | null>(null);
  const [pauseAuctionId, setPauseAuctionId] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Stats
  const [stats, setStats] = useState({
    liveCount: 0,
    totalBids: 0,
    totalValue: 0,
    endingSoon: 0,
    scheduledCount: 0,
  });

  const loadLiveAuctions = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);

    await execute(async () => {
      const response = await auctionsService.list({
        status: AuctionStatus.ACTIVE,
        limit: 50,
      });

      const liveAuctions = response.data || [];

      // Calculate stats
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;

      setStats({
        liveCount: liveAuctions.length,
        totalBids: liveAuctions.reduce((sum, a) => sum + (a.bidCount || 0), 0),
        totalValue: liveAuctions.reduce(
          (sum, a) =>
            sum + (a.currentBid || a.startingBid || a.currentPrice || 0),
          0,
        ),
        endingSoon: liveAuctions.filter(
          (a) => new Date(a.endTime).getTime() - now < oneHour,
        ).length,
        scheduledCount: 0,
      });

      // Load scheduled count separately
      const scheduledResponse = await auctionsService.list({
        status: AuctionStatus.SCHEDULED,
        limit: 1,
      });
      setStats((prev) => ({
        ...prev,
        scheduledCount: scheduledResponse.count || 0,
      }));

      setLastRefresh(new Date());
    });

    if (showRefresh) setRefreshing(false);
  }, []);

  useEffect(() => {
    loadLiveAuctions();
  }, [loadLiveAuctions]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadLiveAuctions(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, loadLiveAuctions]);

  const handlePauseAuction = async (id: string) => {
    try {
      await auctionsService.update(id, { status: AuctionStatus.SCHEDULED });
      toast.success("Auction paused successfully");
      setPauseAuctionId(null);
      loadLiveAuctions(true);
    } catch (error) {
      console.error("Failed to pause auction:", error);
      toast.error("Failed to pause auction");
    }
  };

  const handleEndAuction = async (id: string) => {
    try {
      await auctionsService.update(id, { status: AuctionStatus.ENDED });
      toast.success("Auction ended successfully");
      setEndAuctionId(null);
      loadLiveAuctions(true);
    } catch (error) {
      console.error("Failed to end auction:", error);
      toast.error("Failed to end auction");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Access Denied
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You must be an admin to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading live auctions..." />;
  }

  return (
    <>
      <ConfirmDialog
        isOpen={!!endAuctionId}
        onClose={() => setEndAuctionId(null)}
        onConfirm={async () => {
          if (endAuctionId) await handleEndAuction(endAuctionId);
        }}
        title="End Auction"
        description="Are you sure you want to end this auction immediately? The current highest bidder will win."
        variant="danger"
        confirmLabel="End Auction"
      />

      <ConfirmDialog
        isOpen={!!pauseAuctionId}
        onClose={() => setPauseAuctionId(null)}
        onConfirm={async () => {
          if (pauseAuctionId) await handlePauseAuction(pauseAuctionId);
        }}
        title="Pause Auction"
        description="Are you sure you want to pause this auction? It will be moved to scheduled status and can be resumed later."
        variant="warning"
        confirmLabel="Pause Auction"
      />

      <div className="space-y-6">
        <AdminPageHeader
          title="Live Auctions"
          description={`Real-time monitoring of active auctions • Last updated: ${lastRefresh.toLocaleTimeString()}`}
          actions={
            <>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                  autoRefresh
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {autoRefresh ? (
                  <>
                    <Activity className="h-4 w-4 animate-pulse" />
                    Auto-refresh ON
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4" />
                    Auto-refresh OFF
                  </>
                )}
              </button>
              <button
                onClick={() => loadLiveAuctions(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              <Link
                href="/admin/auctions"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Gavel className="h-4 w-4" />
                All Auctions
              </Link>
            </>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            title="Live Auctions"
            value={stats.liveCount}
            icon={Play}
            color="green"
          />
          <StatCard
            title="Total Bids"
            value={stats.totalBids}
            icon={TrendingUp}
            color="blue"
          />
          <StatCard
            title="Total Value"
            value={formatPrice(stats.totalValue)}
            icon={DollarSign}
            color="purple"
          />
          <StatCard
            title="Ending Soon"
            value={stats.endingSoon}
            icon={AlertTriangle}
            color="orange"
          />
          <StatCard
            title="Scheduled"
            value={stats.scheduledCount}
            icon={Clock}
            color="blue"
          />
        </div>

        {/* Alerts Section */}
        {stats.endingSoon > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-orange-800">
                {stats.endingSoon} auction{stats.endingSoon > 1 ? "s" : ""}{" "}
                ending within the next hour
              </p>
              <p className="text-sm text-orange-600 mt-1">
                Make sure to monitor these auctions closely for any issues.
              </p>
            </div>
          </div>
        )}

        {/* Live Auctions Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auction
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Bid
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bids
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Left
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Watchers
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auctions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Gavel className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <p className="font-medium text-gray-900">
                        No live auctions
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        There are currently no active auctions running.
                      </p>
                      <Link
                        href="/admin/auctions"
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        View All Auctions
                      </Link>
                    </td>
                  </tr>
                ) : (
                  auctions.map((auction) => (
                    <LiveAuctionRow
                      key={auction.id}
                      auction={auction}
                      onPause={(id) => setPauseAuctionId(id)}
                      onEnd={(id) => setEndAuctionId(id)}
                      onView={(slug) =>
                        globalThis.open?.(`/auctions/${slug}`, "_blank")
                      }
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/auctions?status=scheduled"
            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-500 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-blue-600">
                  Scheduled Auctions
                </p>
                <p className="text-sm text-gray-500">
                  {stats.scheduledCount} auctions waiting to start
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/auctions?status=ended"
            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-500 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-blue-600">
                  Ended Auctions
                </p>
                <p className="text-sm text-gray-500">
                  Review completed auctions
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/analytics/auctions"
            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-500 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-blue-600">
                  Auction Analytics
                </p>
                <p className="text-sm text-gray-500">
                  Performance metrics and reports
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
