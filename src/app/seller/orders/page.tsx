/**
 * Seller Orders / Sales Page
 *
 * Route: /seller/orders
 * Lists all orders placed for the seller's products.
 * View-only for sellers — status updates are handled by admin.
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Spinner,
  Card,
  DataTable,
  AdminPageHeader,
  Text,
  getOrderTableColumns,
} from "@/components";
import { useAuth, useApiQuery } from "@/hooks";
import { UI_LABELS, ROUTES, API_ENDPOINTS, THEME_CONSTANTS } from "@/constants";
import type { OrderDocument } from "@/db/schema";
import { formatCurrency, formatDate } from "@/utils";

const { themed, spacing } = THEME_CONSTANTS;
const SELLER_LABELS = UI_LABELS.SELLER_PAGE;

interface OrdersResponse {
  orders: OrderDocument[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// Status filter tabs
const STATUS_TABS = [
  { key: "", label: "All Orders" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

export default function SellerOrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [statusFilter, setStatusFilter] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, authLoading, router]);

  // Build API URL with optional status filter
  const ordersUrl = useMemo(() => {
    const filters = statusFilter
      ? `?filters=${encodeURIComponent(`status==${statusFilter}`)}`
      : "";
    return `${API_ENDPOINTS.SELLER.ORDERS}${filters}`;
  }, [statusFilter]);

  const { data, isLoading } = useApiQuery<OrdersResponse>({
    queryKey: ["seller-orders", statusFilter],
    queryFn: () => fetch(ordersUrl).then((r) => r.json()),
    enabled: !!user,
  });

  const { columns } = useMemo(
    () =>
      getOrderTableColumns(() => {
        /* view only — no drawer needed */
      }),
    [],
  );

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="xl" variant="primary" />
      </div>
    );
  }

  if (!user) return null;

  const orders = data?.orders ?? [];

  return (
    <div className={spacing.stack}>
      <AdminPageHeader
        title={SELLER_LABELS.ORDERS_TITLE}
        subtitle={SELLER_LABELS.ORDERS_SUBTITLE}
      />

      {/* Summary Stats */}
      {!isLoading && orders.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(
            [
              {
                label: "Total",
                count: orders.length,
                color: "text-indigo-600 dark:text-indigo-400",
              },
              {
                label: "Pending",
                count: orders.filter((o) => o.status === "pending").length,
                color: "text-yellow-600 dark:text-yellow-400",
              },
              {
                label: "Confirmed",
                count: orders.filter((o) => o.status === "confirmed").length,
                color: "text-blue-600 dark:text-blue-400",
              },
              {
                label: "Delivered",
                count: orders.filter((o) => o.status === "delivered").length,
                color: "text-green-600 dark:text-green-400",
              },
            ] as const
          ).map(({ label, count, color }) => (
            <Card key={label} className="p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{count}</p>
              <Text size="sm" className={themed.textSecondary}>
                {label}
              </Text>
            </Card>
          ))}
        </div>
      )}

      {/* Status Filter Tabs */}
      <div
        className={`flex gap-1 overflow-x-auto border-b ${themed.borderColor} pb-0`}
      >
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              statusFilter === tab.key
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                : `border-transparent ${themed.textSecondary} hover:text-gray-700 dark:hover:text-gray-300`
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <DataTable<OrderDocument>
        data={orders}
        columns={columns}
        keyExtractor={(o) => o.id}
        loading={isLoading}
        emptyTitle={SELLER_LABELS.ORDERS_EMPTY}
        emptyMessage={SELLER_LABELS.ORDERS_EMPTY_SUBTITLE}
      />

      {/* Revenue Summary */}
      {!isLoading && orders.length > 0 && (
        <Card className={`p-4 ${themed.bgSecondary}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Text className={`font-medium ${themed.textPrimary}`}>
              Total Revenue (all orders)
            </Text>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {formatCurrency(
                orders.reduce((sum, o) => sum + (o.totalPrice ?? 0), 0),
              )}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
