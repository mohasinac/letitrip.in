/**
 * UserOrdersView
 *
 * Extracted from src/app/[locale]/user/orders/page.tsx
 * Lists the current user's orders with status filter tabs and pagination.
 * URL-driven via useUrlTable — bookmark-able at any filter state.
 */

"use client";

import { Suspense, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useApiQuery, useUrlTable } from "@/hooks";
import {
  Heading,
  Spinner,
  EmptyState,
  Card,
  Button,
  Text,
  StatusBadge,
  TablePagination,
} from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { formatCurrency, formatDate } from "@/utils";
import { orderService } from "@/services";
import { useTranslations } from "next-intl";
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

function UserOrdersContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const table = useUrlTable({ defaults: { pageSize: "10" } });
  const tOrders = useTranslations("orders");
  const tLoading = useTranslations("loading");
  const tActions = useTranslations("actions");
  const statusFilter = table.get("status");
  const page = table.getNumber("page", 1);
  const pageSize = table.getNumber("pageSize", 10);

  const STATUS_TABS = [
    { key: "", label: tOrders("tabAll") },
    { key: "pending", label: tOrders("tabPending") },
    { key: "confirmed", label: tOrders("tabConfirmed") },
    { key: "shipped", label: tOrders("tabShipped") },
    { key: "delivered", label: tOrders("tabDelivered") },
    { key: "cancelled", label: tOrders("tabCancelled") },
  ];

  const { data, isLoading } = useApiQuery<{
    orders: OrderDocument[];
    total: number;
    page: number;
    totalPages: number;
  }>({
    queryKey: ["user-orders", table.params.toString()],
    queryFn: () => {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      return orderService.list(params.toString());
    },
    enabled: !!user && !loading,
  });

  const orders: OrderDocument[] = data?.orders ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalOrders = data?.total ?? 0;

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" label={tLoading("default")} />
      </div>
    );
  }

  if (!user) {
    router.push(ROUTES.AUTH.LOGIN);
    return null;
  }

  return (
    <div className={THEME_CONSTANTS.spacing.stack}>
      <Heading level={3}>{tOrders("title")}</Heading>

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
          title={tOrders("noOrders")}
          description={tOrders("emptySubtitle")}
          actionLabel={tActions("browseProducts")}
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
                    {tOrders("orderNumber")} #
                    {order.id.slice(0, 8).toUpperCase()}
                  </Text>
                  <Text className={THEME_CONSTANTS.typography.caption}>
                    {tOrders("placedOn")} {formatDate(order.orderDate)}
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
                    {tOrders("viewOrder")}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <TablePagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          total={totalOrders}
          onPageChange={table.setPage}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

export function UserOrdersView() {
  return (
    <Suspense>
      <UserOrdersContent />
    </Suspense>
  );
}
