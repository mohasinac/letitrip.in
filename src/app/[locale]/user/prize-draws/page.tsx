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

export default function UserPrizeDrawsPage() {
  const { user, loading: sessionLoading } = useSession();
  const table = useUrlTable({ defaults: { pageSize: "12", sort: "-createdAt" } });
  const search = table.get("q") ?? "";
  const sort = table.get("sort") ?? "-createdAt";

  const { data, isLoading } = useQuery<{ items: OrderDoc[] }>({
    queryKey: ["user-prize-draws"],
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
      o.items?.some((item) => item.listingType === "prize-draw"),
    );
    const filtered = q
      ? base.filter((o) =>
          o.id.toLowerCase().includes(q) ||
          o.items.some((it) => it.productTitle?.toLowerCase().includes(q)),
        )
      : base;
    return [...filtered].sort((a, b) =>
      sort === "createdAt"
        ? +new Date(a.createdAt) - +new Date(b.createdAt)
        : +new Date(b.createdAt) - +new Date(a.createdAt),
    );
  }, [data, search, sort]);

  const loading = sessionLoading || isLoading;

  return (
    <Div className="w-full space-y-6">
      <Div>
        <Heading level={1} className="text-2xl font-semibold text-[var(--appkit-color-text)]">
          My Prize Draws
        </Heading>
        {!loading && (
          <Text variant="secondary" className="text-sm mt-0.5">
            {orders.length} prize draw{orders.length !== 1 ? "s" : ""}
          </Text>
        )}
      </Div>

      <ListingToolbar
        searchValue={search}
        searchPlaceholder="Search prize draws…"
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
          <Text variant="secondary">You haven&apos;t entered any prize draws yet.</Text>
          <Link
            href={String(ROUTES.PUBLIC.PRIZE_DRAWS)}
            className="mt-3 inline-block text-sm text-[var(--appkit-color-primary)] hover:underline"
          >
            Browse prize draws
          </Link>
        </Div>
      ) : (
        <Stack gap="md">
          {orders.map((order) => {
            const drawItems = order.items.filter(
              (item) => item.listingType === "prize-draw",
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
                  {drawItems.map((item, idx) => (
                    <Row key={idx} justify="between">
                      <Link
                        href={String(ROUTES.PUBLIC.PRIZE_DRAW_DETAIL(item.productId))}
                        className="text-sm text-[var(--appkit-color-text)] hover:underline line-clamp-1"
                      >
                        {item.productTitle}
                        {item.quantity > 1 ? ` — ${item.quantity} entries` : " — 1 entry"}
                      </Link>
                      <Text className="text-sm font-medium text-[var(--appkit-color-text)] shrink-0 ml-2">
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
