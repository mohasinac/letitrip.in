"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ordersService } from "@/services/orders.service";
import { MobileDataTable } from "@/components/mobile/MobileDataTable";
import { MobilePullToRefresh } from "@/components/mobile/MobilePullToRefresh";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Price, DateDisplay } from "@/components/common/values";
import type { OrderCardFE } from "@/types/frontend/order.types";

export const dynamic = "force-dynamic";

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [orders, setOrders] = useState<OrderCardFE[]>([]);
  const [loading, setLoading] = useState(true);

  // Cursor pagination state
  const [cursors, setCursors] = useState<(string | null)[]>([null]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Filters from URL
  const [filters, setFilters] = useState({
    status: searchParams.get("status") || undefined,
    sortBy: searchParams.get("sortBy") || "created_at",
    sortOrder: (searchParams.get("sortOrder") || "desc") as "asc" | "desc",
  });

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user, currentPage, filters]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.sortBy) params.set("sortBy", filters.sortBy);
    if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);

    router.push(`/user/orders?${params.toString()}`, { scroll: false });
  }, [filters]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const startAfter = cursors[currentPage - 1];
      const response = await ordersService.list({
        ...filters,
        startAfter: startAfter || undefined,
        limit: 20,
      } as any);

      setOrders(response.data || []);

      // Check if it's cursor pagination
      if ("hasNextPage" in response.pagination) {
        setHasNextPage(response.pagination.hasNextPage || false);

        // Store next cursor
        if ("nextCursor" in response.pagination) {
          const cursorPagination = response.pagination as any;
          if (cursorPagination.nextCursor) {
            setCursors((prev) => {
              const newCursors = [...prev];
              newCursors[currentPage] = cursorPagination.nextCursor || null;
              return newCursors;
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      globalThis.scrollTo?.({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
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
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium text-gray-900">#{order.orderNumber}</p>
          <DateDisplay
            date={order.createdAt}
            format="short"
            className="text-sm text-gray-500"
          />
        </div>
        <StatusBadge status={order.status} />
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500">{order.shopName || "N/A"}</p>
          <p className="font-semibold text-gray-900">
            <Price amount={order.total} />
          </p>
        </div>
        <StatusBadge status={order.paymentStatus} />
      </div>
    </div>
  );

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    await loadOrders();
  };

  if (!user) {
    router.push("/login?redirect=/user/orders");
    return null;
  }

  return (
    <MobilePullToRefresh onRefresh={handleRefresh} className="min-h-screen">
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-2">Track and manage your orders</p>
            <p className="text-xs text-gray-400 mt-1 lg:hidden">
              Pull down to refresh
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2
                  className="w-8 h-8 text-primary animate-spin"
                  role="status"
                />
              </div>
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
                  isLoading={loading}
                  onRowClick={(order) =>
                    router.push(`/user/orders/${order.id}`)
                  }
                  renderMobileCard={renderMobileOrderCard}
                />

                {/* Pagination Controls */}
                {orders.length > 0 && (
                  <div className="border-t border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1 || loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-target"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Previous</span>
                      </button>

                      <span className="text-sm text-gray-600">
                        Page {currentPage}
                      </span>

                      <button
                        onClick={handleNextPage}
                        disabled={!hasNextPage || loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-target"
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

// TODO: Replace hardcoded strings with constants from site constants
// Texts to consider: "My Orders", "Track and manage your orders", "No orders found", "You haven't placed any orders yet", "Start Shopping", "Previous", "Page {currentPage} • {orders.length} orders", "Next"
