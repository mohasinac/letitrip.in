"use client";

import { useMemo } from "react";
import { useAuth, useApiQuery, useUrlTable } from "@/hooks";
import {
  Heading,
  Spinner,
  EmptyState,
  Card,
  Button,
  Text,
  StatusBadge,
} from "@/components";
import { useRouter } from "next/navigation";
import { ROUTES, UI_LABELS, THEME_CONSTANTS, API_ENDPOINTS } from "@/constants";
import { formatCurrency, formatDate } from "@/utils";
import { apiClient } from "@/lib/api-client";
import type { OrderDocument } from "@/db/schema";

const STATUS_MAP: Record<
  string,
  "pending" | "info" | "active" | "success" | "danger"
> = {
  pending: "pending",
  confirmed: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "danger",
  returned: "danger",
};

const STATUS_TABS = [
  { key: "", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

export default function UserOrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const table = useUrlTable({});
  const statusFilter = table.get("status");

  const ordersUrl = useMemo(() => {
    const url = API_ENDPOINTS.ORDERS.LIST;
    return statusFilter ? `${url}?status=${statusFilter}` : url;
  }, [statusFilter]);

  const { data, isLoading } = useApiQuery<{
    orders: OrderDocument[];
    total: number;
  }>({
    queryKey: ["user-orders", table.params.toString()],
    queryFn: () => apiClient.get(ordersUrl),
    enabled: !!user && !loading,
  });

  const orders: OrderDocument[] = data?.orders ?? [];

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" label={UI_LABELS.LOADING.DEFAULT} />
      </div>
    );
  }

  if (!user) {
    router.push(ROUTES.AUTH.LOGIN);
    return null;
  }

  return (
    <div className={THEME_CONSTANTS.spacing.stack}>
      <Heading level={3}>{UI_LABELS.USER.ORDERS.TITLE}</Heading>

      {/* Status filter tabs */}
      <div
        className={`flex gap-1 overflow-x-auto border-b ${THEME_CONSTANTS.themed.border} pb-0`}
      >
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => table.set("status", tab.key)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              statusFilter === tab.key
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                : `border-transparent ${THEME_CONSTANTS.themed.textSecondary} hover:text-gray-700 dark:hover:text-gray-300`
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={
            <svg
              className="w-24 h-24 mx-auto text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          }
          title={UI_LABELS.USER.ORDERS.EMPTY}
          description={UI_LABELS.USER.ORDERS.EMPTY_SUBTITLE}
          actionLabel={UI_LABELS.USER.ORDERS.BROWSE_PRODUCTS}
          onAction={() => router.push(ROUTES.PUBLIC.PRODUCTS)}
        />
      ) : (
        <div className={THEME_CONSTANTS.spacing.stack}>
          {orders.map((order) => (
            <Card
              key={order.id}
              className={THEME_CONSTANTS.spacing.cardPadding}
            >
              <div
                className={`flex flex-col md:flex-row md:items-center md:justify-between ${THEME_CONSTANTS.spacing.gap.md}`}
              >
                <div className={THEME_CONSTANTS.spacing.stackSmall}>
                  <Heading level={6}>{order.productTitle}</Heading>
                  <Text className={THEME_CONSTANTS.typography.caption}>
                    {UI_LABELS.USER.ORDERS.ORDER_NUMBER} #
                    {order.id.slice(0, 8).toUpperCase()}
                  </Text>
                  <Text className={THEME_CONSTANTS.typography.caption}>
                    {UI_LABELS.USER.ORDERS.PLACED_ON}{" "}
                    {formatDate(order.orderDate)}
                  </Text>
                </div>
                <div
                  className={`flex items-center ${THEME_CONSTANTS.spacing.gap.md}`}
                >
                  <Text className="font-semibold">
                    {formatCurrency(order.totalPrice, order.currency)}
                  </Text>
                  <StatusBadge
                    status={STATUS_MAP[order.status]}
                    label={
                      order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)
                    }
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      router.push(ROUTES.USER.ORDER_DETAIL(order.id))
                    }
                  >
                    {UI_LABELS.USER.ORDERS.VIEW_ORDER}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
