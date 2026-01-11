"use client";

import { EmptyState } from "@/components/common/EmptyState";
import { PageState } from "@/components/common/PageState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DateDisplay } from "@/components/common/values/DateDisplay";
import { Price } from "@/components/common/values/Price";
import { MobileDataTable } from "@/components/mobile/MobileDataTable";
import { MobilePullToRefresh } from "@/components/mobile/MobilePullToRefresh";
import { OrderCardSkeletonList } from "@/components/skeletons";
import { useAuth } from "@/contexts/AuthContext";
import { ordersService } from "@/services/orders.service";
import type { OrderCardFE } from "@/types/frontend/order.types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export const dynamic = "force-dynamic";

export default function OrdersPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Use resource list state for managing orders
  const [orders, setOrders] = useState<OrderCardFE[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ordersService.list({
        limit: 20,
        page: currentPage,
      } as any);
      setOrders(response.data || []);
      setHasNextPage(
        (response.pagination as any)?.hasNextPage || response.data.length >= 20
      );
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    if (user) {
      refresh();
    }
  }, [refresh, user]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      globalThis.scrollTo?.({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(currentPage + 1);
      globalThis.scrollTo?.({ top: 0, behavior: "smooth" });
    }
  };

  const columns = [
    {
      key: "orderId",
      header: "Order ID",
      sortable: true,
      render: (order: any) => (
        <button
          onClick={() => router.push(`/user/orders/${order.id}`)}
          className="font-medium text-primary hover:underline"
        >
          #{order.orderNumber}
        </button>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      sortable: true,
      render: (order: any) => (
        <DateDisplay date={order.createdAt} format="short" />
      ),
    },
    {
      key: "shopName",
      header: "Shop",
      render: (order: any) => order.shopName || "N/A",
    },
    {
      key: "total",
      header: "Total",
      sortable: true,
      render: (order: any) => <Price amount={order.total} />,
    },
    {
      key: "status",
      header: "Status",
      render: (order: any) => <StatusBadge status={order.status} />,
    },
    {
      key: "paymentStatus",
      header: "Payment",
      render: (order: any) => <StatusBadge status={order.paymentStatus} />,
    },
  ];

  // Mobile card renderer for orders
  const renderMobileOrderCard = (order: OrderCardFE) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            #{order.orderNumber}
          </p>
          <DateDisplay
            date={order.createdAt}
            format="short"
            className="text-sm text-gray-500 dark:text-gray-400"
          />
        </div>
        <StatusBadge status={order.status} />
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {order.shopName || "N/A"}
          </p>
          <p className="font-semibold text-gray-900 dark:text-white">
            <Price amount={order.total} />
          </p>
        </div>
        <StatusBadge status={order.paymentStatus} />
      </div>
    </div>
  );

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    await refresh();
  };

  if (!user) {
    router.push("/login?redirect=/user/orders");
    return null;
  }

  if (error) {
    return (
      <PageState.Error
        message={error instanceof Error ? error.message : String(error)}
        onRetry={refresh}
      />
    );
  }

  return (
    <MobilePullToRefresh onRefresh={handleRefresh} className="min-h-screen">
      <div className="bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Orders
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Track and manage your orders
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 lg:hidden">
              Pull down to refresh
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            {isLoading ? (
              <OrderCardSkeletonList count={5} />
            ) : orders.length === 0 ? (
              <EmptyState
                title="No orders found"
                description="You haven't placed any orders yet"
                action={{
                  label: "Start Shopping",
                  onClick: () => router.push("/"),
                }}
              />
            ) : (
              <>
                <MobileDataTable
                  data={orders}
                  columns={columns}
                  keyExtractor={(order) => order.id}
                  isLoading={isLoading}
                  onRowClick={(order) =>
                    router.push(`/user/orders/${order.id}`)
                  }
                  renderMobileCard={renderMobileOrderCard}
                />

                {/* Pagination Controls */}
                {orders.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1 || isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-target"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Previous</span>
                      </button>

                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Page {currentPage}
                      </span>

                      <button
                        onClick={handleNextPage}
                        disabled={!hasNextPage || isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-target"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </MobilePullToRefresh>
  );
}
