"use client";

/**
 * Admin RipLimit Dashboard Page
 * Epic: E028 - RipLimit Bidding Currency
 *
 * Admin dashboard for:
 * - System-wide RipLimit statistics
 * - User account management
 * - Transaction monitoring
 * - Balance adjustments
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  Users,
  AlertTriangle,
  DollarSign,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  X,
  Check,
  Ban,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api.service";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useDebounce } from "@/hooks/useDebounce";

// Types for admin views
interface RipLimitStats {
  totalCirculation: number;
  totalAvailable: number;
  totalBlocked: number;
  totalRevenue: number;
  totalRefunded: number;
  netRevenue: number;
  userCount: number;
  unpaidUserCount: number;
}

interface RipLimitUser {
  userId: string;
  availableBalance: number;
  blockedBalance: number;
  hasUnpaidAuctions: boolean;
  isBlocked: boolean;
  unpaidAuctionIds: string[];
  createdAt: { _seconds: number };
  updatedAt: { _seconds: number };
  user: {
    email: string;
    displayName?: string;
    photoURL?: string;
  } | null;
}

interface Pagination {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

type UserFilter = "all" | "unpaid" | "blocked";

export default function AdminRipLimitPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();

  // State
  const [stats, setStats] = useState<RipLimitStats | null>(null);
  const [users, setUsers] = useState<RipLimitUser[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState<UserFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Modal states
  const [selectedUser, setSelectedUser] = useState<RipLimitUser | null>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState("");
  const [processingAction, setProcessingAction] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push("/forbidden");
    }
  }, [user, isAdmin, authLoading, router]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const response = await apiService.get<{
        success: boolean;
        data: RipLimitStats;
      }>("/admin/riplimit/stats");

      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Failed to load stats:", err);
      setError("Failed to load RipLimit statistics");
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Load users
  const loadUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const params = new URLSearchParams();
      params.set("page", currentPage.toString());
      params.set("pageSize", "20");

      if (userFilter === "unpaid") {
        params.set("hasUnpaid", "true");
      } else if (userFilter === "blocked") {
        params.set("isBlocked", "true");
      }

      const response = await apiService.get<{
        success: boolean;
        data: RipLimitUser[];
        pagination: Pagination;
      }>(`/admin/riplimit/users?${params.toString()}`);

      if (response.success) {
        setUsers(response.data);
        setPagination(response.pagination);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoadingUsers(false);
    }
  }, [currentPage, userFilter]);

  // Initial load
  useEffect(() => {
    if (user && isAdmin) {
      loadStats();
      loadUsers();
    }
  }, [user, isAdmin, loadStats, loadUsers]);

  // Reload on filter change
  useEffect(() => {
    if (user && isAdmin) {
      setCurrentPage(1);
    }
  }, [userFilter, user, isAdmin]);

  // Reload on page change
  useEffect(() => {
    if (user && isAdmin) {
      loadUsers();
    }
  }, [currentPage, user, isAdmin, loadUsers]);

  // Handle balance adjustment
  const handleAdjust = async () => {
    if (!selectedUser || adjustAmount === 0 || !adjustReason.trim()) {
      setError("Please enter amount and reason");
      return;
    }

    try {
      setProcessingAction(true);
      setError(null);

      await apiService.post(
        `/admin/riplimit/users/${selectedUser.userId}/adjust`,
        {
          amount: adjustAmount,
          reason: adjustReason,
        }
      );

      setSuccessMessage(
        `Balance adjusted by ${adjustAmount >= 0 ? "+" : ""}${adjustAmount} RL`
      );
      setShowAdjustModal(false);
      setSelectedUser(null);
      setAdjustAmount(0);
      setAdjustReason("");

      loadStats();
      loadUsers();

      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to adjust balance";
      setError(message);
    } finally {
      setProcessingAction(false);
    }
  };

  // Format currency
  const formatINR = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;
  const formatRL = (amount: number) => `${amount.toLocaleString("en-IN")} RL`;

  // Filter users by search
  const filteredUsers = users.filter((u) => {
    if (!debouncedSearch) return true;
    const searchLower = debouncedSearch.toLowerCase();
    return (
      u.userId.toLowerCase().includes(searchLower) ||
      u.user?.email?.toLowerCase().includes(searchLower) ||
      u.user?.displayName?.toLowerCase().includes(searchLower)
    );
  });

  // Loading state
  if (authLoading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Wallet className="w-8 h-8 text-blue-600" />
              RipLimit Administration
            </h1>
            <p className="text-gray-600 mt-1">Manage bidding currency system</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button
              variant="outline"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={() => {
                loadStats();
                loadUsers();
              }}
            >
              Refresh
            </Button>
            <Button
              variant="outline"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={() => {
                // Export users CSV
                const csv = [
                  [
                    "User ID",
                    "Email",
                    "Display Name",
                    "Available",
                    "Blocked",
                    "Total",
                    "Unpaid",
                    "Blocked Status",
                  ].join(","),
                  ...users.map((u) =>
                    [
                      u.userId,
                      u.user?.email || "",
                      u.user?.displayName || "",
                      u.availableBalance,
                      u.blockedBalance,
                      u.availableBalance + u.blockedBalance,
                      u.hasUnpaidAuctions ? "Yes" : "No",
                      u.isBlocked ? "Yes" : "No",
                    ].join(",")
                  ),
                ].join("\n");

                const blob = new Blob([csv], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `riplimit-users-${new Date().toISOString()}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
              }}
            >
              Export
            </Button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <Check className="w-5 h-5" />
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {error}
            </div>
            <button onClick={() => setError(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Circulation */}
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Total Circulation
                </p>
                {loadingStats ? (
                  <div className="h-8 w-32 bg-gray-200 animate-pulse rounded mt-1" />
                ) : (
                  <>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatRL(stats?.totalCirculation || 0)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      ≈ {formatINR(stats?.totalCirculation || 0)}
                    </p>
                  </>
                )}
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          {/* Net Revenue */}
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Net Revenue</p>
                {loadingStats ? (
                  <div className="h-8 w-32 bg-gray-200 animate-pulse rounded mt-1" />
                ) : (
                  <>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {formatINR(stats?.netRevenue || 0)}
                    </p>
                    <div className="flex gap-4 text-xs text-gray-500 mt-1">
                      <span>↑ {formatINR(stats?.totalRevenue || 0)}</span>
                      <span>↓ {formatINR(stats?.totalRefunded || 0)}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          {/* Active Users */}
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Active Users
                </p>
                {loadingStats ? (
                  <div className="h-8 w-20 bg-gray-200 animate-pulse rounded mt-1" />
                ) : (
                  <>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stats?.userCount?.toLocaleString("en-IN") || 0}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      with RipLimit accounts
                    </p>
                  </>
                )}
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          {/* Unpaid Auctions */}
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Unpaid Auctions
                </p>
                {loadingStats ? (
                  <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1" />
                ) : (
                  <>
                    <p
                      className={`text-2xl font-bold mt-1 ${
                        (stats?.unpaidUserCount || 0) > 0
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      {stats?.unpaidUserCount || 0}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      users with unpaid wins
                    </p>
                  </>
                )}
              </div>
              <div
                className={`p-3 rounded-full ${
                  (stats?.unpaidUserCount || 0) > 0
                    ? "bg-red-100"
                    : "bg-gray-100"
                }`}
              >
                <AlertTriangle
                  className={`w-6 h-6 ${
                    (stats?.unpaidUserCount || 0) > 0
                      ? "text-red-600"
                      : "text-gray-400"
                  }`}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Balance Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card title="Balance Distribution">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-gray-600">Available Balance</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {formatRL(stats?.totalAvailable || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-gray-600">Blocked (Active Bids)</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {formatRL(stats?.totalBlocked || 0)}
                </span>
              </div>
              {stats && (
                <div className="mt-4">
                  <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-green-500"
                      style={{
                        width: `${
                          (stats.totalAvailable /
                            (stats.totalCirculation || 1)) *
                          100
                        }%`,
                      }}
                    />
                    <div
                      className="h-full bg-orange-500"
                      style={{
                        width: `${
                          (stats.totalBlocked / (stats.totalCirculation || 1)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card title="Revenue Summary">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ArrowDownLeft className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600">Total Purchases</span>
                </div>
                <span className="font-semibold text-green-600">
                  +{formatINR(stats?.totalRevenue || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ArrowUpRight className="w-4 h-4 text-red-500" />
                  <span className="text-gray-600">Total Refunds</span>
                </div>
                <span className="font-semibold text-red-600">
                  -{formatINR(stats?.totalRefunded || 0)}
                </span>
              </div>
              <div className="border-t pt-4 flex items-center justify-between">
                <span className="font-medium text-gray-900">Net Revenue</span>
                <span className="text-xl font-bold text-green-600">
                  {formatINR(stats?.netRevenue || 0)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* User Accounts Section */}
        <Card
          title="User Accounts"
          description={`${pagination?.totalCount || 0} total accounts`}
          headerAction={
            <div className="flex items-center gap-3">
              {/* Filter */}
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value as UserFilter)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Users</option>
                <option value="unpaid">Unpaid Auctions</option>
                <option value="blocked">Blocked</option>
              </select>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
            </div>
          }
          noPadding
        >
          {loadingUsers ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
              <p className="text-gray-500 mt-2">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No users found</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchQuery
                  ? "Try adjusting your search"
                  : "No RipLimit accounts yet"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Available
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Blocked
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((u) => (
                      <tr key={u.userId} className="hover:bg-gray-50">
                        {/* User Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {u.user?.photoURL ? (
                              <Image
                                src={u.user.photoURL}
                                alt={u.user.displayName || u.user.email}
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-sm">
                                  {(u.user?.displayName ||
                                    u.user?.email ||
                                    "U")[0].toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">
                                {u.user?.displayName || "No name"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {u.user?.email || u.userId}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Available Balance */}
                        <td className="px-6 py-4 text-right">
                          <span className="font-medium text-green-600">
                            {formatRL(u.availableBalance)}
                          </span>
                        </td>

                        {/* Blocked Balance */}
                        <td className="px-6 py-4 text-right">
                          <span className="font-medium text-orange-600">
                            {formatRL(u.blockedBalance)}
                          </span>
                        </td>

                        {/* Total Balance */}
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-gray-900">
                            {formatRL(u.availableBalance + u.blockedBalance)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {u.isBlocked && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                <Ban className="w-3 h-3" />
                                Blocked
                              </span>
                            )}
                            {u.hasUnpaidAuctions && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                <AlertTriangle className="w-3 h-3" />
                                Unpaid
                              </span>
                            )}
                            {!u.isBlocked && !u.hasUnpaidAuctions && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                <Check className="w-3 h-3" />
                                Active
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                router.push(`/admin/users?search=${u.userId}`)
                              }
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View User"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setShowAdjustModal(true);
                              }}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Adjust Balance"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="border-t border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={!pagination.hasPreviousPage || loadingUsers}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>

                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {pagination.totalPages}
                    </span>

                    <button
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={!pagination.hasNextPage || loadingUsers}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Adjust Balance Modal */}
        {showAdjustModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Adjust Balance
                </h2>
                <button
                  onClick={() => {
                    setShowAdjustModal(false);
                    setSelectedUser(null);
                    setAdjustAmount(0);
                    setAdjustReason("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* User Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {(selectedUser.user?.displayName ||
                        selectedUser.user?.email ||
                        "U")[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedUser.user?.displayName || "No name"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedUser.user?.email}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Available</p>
                    <p className="font-semibold text-green-600">
                      {formatRL(selectedUser.availableBalance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Blocked</p>
                    <p className="font-semibold text-orange-600">
                      {formatRL(selectedUser.blockedBalance)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Adjustment Amount */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adjustment Amount (RL)
                </label>
                <input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  placeholder="Enter positive to add, negative to deduct"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Positive values add RipLimit, negative values deduct
                </p>
              </div>

              {/* Reason */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason *
                </label>
                <textarea
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Enter reason for adjustment..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Preview */}
              {adjustAmount !== 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    New balance will be:{" "}
                    <strong>
                      {formatRL(selectedUser.availableBalance + adjustAmount)}
                    </strong>
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setShowAdjustModal(false);
                    setSelectedUser(null);
                    setAdjustAmount(0);
                    setAdjustReason("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  isLoading={processingAction}
                  onClick={handleAdjust}
                  disabled={adjustAmount === 0 || !adjustReason.trim()}
                >
                  Apply Adjustment
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
