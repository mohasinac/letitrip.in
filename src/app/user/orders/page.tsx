"use client";

import { useAuth, useApiQuery } from "@/hooks";
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

export default function UserOrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const { data, isLoading } = useApiQuery<{
    data: { orders: OrderDocument[]; total: number };
  }>({
    queryKey: ["user-orders"],
    queryFn: () => apiClient.get(API_ENDPOINTS.ORDERS.LIST),
    enabled: !!user && !loading,
  });

  const orders: OrderDocument[] = data?.data?.orders ?? [];

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
