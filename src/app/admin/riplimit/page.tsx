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

import { AdjustBalanceModal } from "@/components/admin/riplimit/AdjustBalanceModal";
import { RipLimitStatsCards } from "@/components/admin/riplimit/RipLimitStats";
import { UsersTable } from "@/components/admin/riplimit/UsersTable";
import { Price } from "@/components/common/values";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";
import { useFilters } from "@/hooks/useFilters";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import { apiService } from "@/services/api.service";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Download,
  Loader2,
  RefreshCw,
  Wallet,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

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

  // State - Stats loading
  const {
    data: stats,
    setData: setStats,
    isLoading: loadingStats,
    execute: executeLoadStats,
  } = useLoadingState<RipLimitStats | null>({
    initialData: null,
    onLoadError: (error) => {
      logError(error, { component: "AdminRipLimit.loadStats" });
      setError("Failed to load RipLimit statistics");
    },
  });

  // State - Users loading
  const {
    data: users,
    setData: setUsers,
    isLoading: loadingUsers,
    execute: executeLoadUsers,
  } = useLoadingState<RipLimitUser[]>({
    initialData: [],
    onLoadError: (error) => {
      logError(error, { component: "AdminRipLimit.loadUsers" });
    },
  });

  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters with URL sync
  const {
    filters: { userFilter = "all", currentPage = 1 },
    updateFilters,
    applyFilters,
  } = useFilters<{ userFilter: UserFilter; currentPage: number }>(
    { userFilter: "all", currentPage: 1 },
    { syncWithUrl: true },
  );

  const setUserFilter = (filter: UserFilter) => {
    updateFilters({ userFilter: filter, currentPage: 1 });
    applyFilters();
  };

  const setCurrentPage = (page: number) => {
    updateFilters({ userFilter, currentPage: page });
    applyFilters();
  };

  // Modal states
  const [selectedUser, setSelectedUser] = useState<RipLimitUser | null>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push("/forbidden");
    }
  }, [user, isAdmin, authLoading, router]);

  // Load stats
  const loadStats = useCallback(
    () =>
      executeLoadStats(async () => {
        const response = await apiService.get<{
          success: boolean;
          data: RipLimitStats;
        }>("/admin/riplimit/stats");

        if (response.success) {
          setStats(response.data);
        }
      }),
    [executeLoadStats, setStats],
  );

  // Load users
  const loadUsers = useCallback(
    () =>
      executeLoadUsers(async () => {
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
      }),
    [currentPage, userFilter, executeLoadUsers, setUsers],
  );

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
  const handleAdjust = async (amount: number, reason: string) => {
    if (!selectedUser) return;

    try {
      setProcessingAction(true);
      setError(null);

      await apiService.post(
        `/admin/riplimit/users/${selectedUser.userId}/adjust`,
        {
          amount,
          reason,
        },
      );

      setSuccessMessage(
        `Balance adjusted by ${amount >= 0 ? "+" : ""}${amount} RL`,
      );
      setShowAdjustModal(false);
      setSelectedUser(null);

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

  // Loading state
  if (authLoading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Wallet className="w-8 h-8 text-blue-600" />
              RipLimit Administration
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage bidding currency system
            </p>
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
                  ...(users || []).map((u) =>
                    [
                      u.userId,
                      u.user?.email || "",
                      u.user?.displayName || "",
                      u.availableBalance,
                      u.blockedBalance,
                      u.availableBalance + u.blockedBalance,
                      u.hasUnpaidAuctions ? "Yes" : "No",
                      u.isBlocked ? "Yes" : "No",
                    ].join(","),
                  ),
                ].join("\n");

                const blob = new Blob([csv], { type: "text/csv" });
                const url = globalThis.URL?.createObjectURL(blob) || "";
                const a = document.createElement("a");
                a.href = url;
                a.download = `riplimit-users-${new Date().toISOString()}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                globalThis.URL?.revokeObjectURL(url);
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
        <RipLimitStatsCards stats={stats} loading={loadingStats} />

        {/* Balance Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card title="Balance Distribution">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Available Balance
                  </span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {(stats?.totalAvailable || 0).toLocaleString("en-IN")} RL
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Blocked (Active Bids)
                  </span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {(stats?.totalBlocked || 0).toLocaleString("en-IN")} RL
                </span>
              </div>
              {stats && (
                <div className="mt-4">
                  <div className="w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
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
                  <span className="text-gray-600 dark:text-gray-400">
                    Total Purchases
                  </span>
                </div>
                <span className="font-semibold text-green-600">
                  +<Price amount={stats?.totalRevenue || 0} />
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ArrowUpRight className="w-4 h-4 text-red-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Total Refunds
                  </span>
                </div>
                <span className="font-semibold text-red-600">
                  -<Price amount={stats?.totalRefunded || 0} />
                </span>
              </div>
              <div className="border-t dark:border-gray-700 pt-4 flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-white">
                  Net Revenue
                </span>
                <span className="text-xl font-bold text-green-600">
                  <Price amount={stats?.netRevenue || 0} />
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* User Accounts Table */}
        <UsersTable
          users={users || []}
          loading={loadingUsers}
          pagination={pagination}
          userFilter={userFilter}
          onFilterChange={(filter) => setUserFilter(filter)}
          onPageChange={(page) => setCurrentPage(page)}
          onViewUser={(userId) => router.push(`/admin/users?search=${userId}`)}
          onAdjustBalance={(user) => {
            setSelectedUser(user);
            setShowAdjustModal(true);
          }}
        />

        {/* Adjust Balance Modal */}
        {selectedUser && (
          <AdjustBalanceModal
            user={selectedUser}
            isOpen={showAdjustModal}
            isProcessing={processingAction}
            onClose={() => {
              setShowAdjustModal(false);
              setSelectedUser(null);
            }}
            onAdjust={handleAdjust}
          />
        )}
      </div>
    </main>
  );
}
