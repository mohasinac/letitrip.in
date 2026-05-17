"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import {
  useSession,
  useUrlTable,
  ROUTES,
  Div,
  Heading,
  Text,
  Stack,
  Row,
  Badge,
} from "@mohasinac/appkit/client";
import { ListingToolbar } from "@mohasinac/appkit/ui";

const SORT_OPTIONS = [
  { value: "-createdAt", label: "Newest" },
  { value: "createdAt",  label: "Oldest" },
  { value: "-totalAmount", label: "Highest total" },
  { value: "totalAmount",  label: "Lowest total" },
];
import { API_ROUTES } from "@/constants";

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
  const table = useUrlTable({ defaults: { pageSize: "12", sort: "-createdAt" } });
  const search = table.get("q") ?? "";
  const sort = table.get("sort") ?? "-createdAt";

  const { data, isLoading } = useQuery<{ items: OrderDoc[] }>({
    queryKey: ["user-pre-orders"],
    queryFn: () =>
      fetch(`${API_ROUTES.USER.ORDERS}?perPage=100`)
        .then((r) => r.json())
        .then((r) => r.data),
    enabled: !sessionLoading && !!user,
    staleTime: 30_000,
  });

  const orders = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = (data?.items ?? []).filter((o) =>
      o.items?.some((item) => item.listingType === "pre-order"),
    );
    const filtered = q
      ? base.filter((o) =>
          o.id.toLowerCase().includes(q) ||
          o.items.some((it) => it.productTitle?.toLowerCase().includes(q)),
        )
      : base;
    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "createdAt":     return +new Date(a.createdAt) - +new Date(b.createdAt);
        case "-totalAmount":  return (b.totalAmount ?? 0) - (a.totalAmount ?? 0);
        case "totalAmount":   return (a.totalAmount ?? 0) - (b.totalAmount ?? 0);
        case "-createdAt":
        default:              return +new Date(b.createdAt) - +new Date(a.createdAt);
      }
    });
  }, [data, search, sort]);

  const loading = sessionLoading || isLoading;

  return (
    <Div className="w-full space-y-6">
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

      <ListingToolbar
        searchValue={search}
        searchPlaceholder="Search pre-orders…"
        onSearchChange={(v) => table.set("q", v)}
        sortValue={sort}
        sortOptions={SORT_OPTIONS}
        onSortChange={(v) => table.set("sort", v)}
        hideViewToggle
        hasActiveState={!!search}
        onResetAll={() => table.clear()}
      />

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
