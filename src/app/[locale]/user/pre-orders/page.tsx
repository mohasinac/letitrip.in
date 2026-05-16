"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  useSession,
  ROUTES,
  Div,
  Heading,
  Text,
  Stack,
  Row,
  Badge,
} from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants/api";

interface OrderItem {
  productId: string;
  productTitle: string;
  quantity: number;
  price: number;
  listingType?: string;
}

interface OrderDoc {
  id: string;
  status: string;
  createdAt: string | Date;
  items: OrderItem[];
  totalAmount: number;
}

function paise(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

const STATUS_VARIANT: Record<string, "active" | "pending" | "danger" | "info" | "admin"> = {
  PENDING:    "pending",
  PROCESSING: "pending",
  SHIPPED:    "info",
  DELIVERED:  "active",
  CANCELLED:  "danger",
};

export default function UserPreOrdersPage() {
  const { user, loading: sessionLoading } = useSession();

  const { data, isLoading } = useQuery<{ items: OrderDoc[] }>({
    queryKey: ["user-pre-orders"],
    queryFn: () =>
      fetch(`${API_ROUTES.USER.ORDERS}?perPage=100`)
        .then((r) => r.json())
        .then((r) => r.data),
    enabled: !sessionLoading && !!user,
    staleTime: 30_000,
  });

  const orders = useMemo(
    () =>
      (data?.items ?? []).filter((o) =>
        o.items?.some((item) => item.listingType === "pre-order"),
      ),
    [data],
  );

  const loading = sessionLoading || isLoading;

  return (
    <Div className="w-full max-w-3xl space-y-6">
      <Div>
        <Heading level={1} className="text-2xl font-semibold text-[var(--appkit-color-text)]">
          My Pre-Orders
        </Heading>
        {!loading && (
          <Text variant="secondary" className="text-sm mt-0.5">
            {orders.length} pre-order{orders.length !== 1 ? "s" : ""}
          </Text>
        )}
      </Div>

      {loading ? (
        <Stack gap="md">
          {Array.from({ length: 3 }).map((_, i) => (
            <Div
              key={i}
              className="animate-pulse rounded-xl border border-[var(--appkit-color-border)] p-5 space-y-3"
            >
              <Div className="h-4 w-1/3 rounded bg-[var(--appkit-color-border)]" />
              <Div className="h-3 w-1/2 rounded bg-[var(--appkit-color-border)]" />
            </Div>
          ))}
        </Stack>
      ) : orders.length === 0 ? (
        <Div className="py-24 text-center">
          <Text variant="secondary">You haven&apos;t placed any pre-orders yet.</Text>
          <Link
            href={String(ROUTES.PUBLIC.PRE_ORDERS)}
            className="mt-3 inline-block text-sm text-[var(--appkit-color-primary)] hover:underline"
          >
            Browse pre-orders
          </Link>
        </Div>
      ) : (
        <Stack gap="md">
          {orders.map((order) => {
            const preOrderItems = order.items.filter(
              (item) => item.listingType === "pre-order",
            );
            const date = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "";
            const statusVariant = STATUS_VARIANT[order.status] ?? "pending";
            return (
              <Div
                key={order.id}
                className="rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] p-5 shadow-sm"
              >
                <Row justify="between" align="start" gap="3">
                  <Div className="space-y-1 min-w-0">
                    <Link
                      href={String(ROUTES.USER.ORDER_DETAIL(order.id))}
                      className="text-sm font-semibold text-[var(--appkit-color-text)] hover:underline"
                    >
                      Order #{order.id}
                    </Link>
                    <Text variant="secondary" className="text-xs">{date}</Text>
                  </Div>
                  <Badge variant={statusVariant} className="shrink-0 capitalize">
                    {order.status.toLowerCase()}
                  </Badge>
                </Row>
                <Stack gap="xs" className="mt-3 pt-3 border-t border-[var(--appkit-color-border-subtle)]">
                  {preOrderItems.map((item, idx) => (
                    <Row key={idx} justify="between">
                      <Text className="text-sm text-[var(--appkit-color-text)]">
                        {item.productTitle}
                        {item.quantity > 1 ? ` ×${item.quantity}` : ""}
                      </Text>
                      <Text className="text-sm font-medium text-[var(--appkit-color-text)]">
                        {paise(item.price * item.quantity)}
                      </Text>
                    </Row>
                  ))}
                </Stack>
              </Div>
            );
          })}
        </Stack>
      )}
    </Div>
  );
}
