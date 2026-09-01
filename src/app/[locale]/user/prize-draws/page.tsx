"use client";

import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import {
  sortBy,
  useUrlTable,
  ROUTES,
  Div,
  Text,
  Stack,
  Row,
  Badge,
  DataListingView,
} from "@mohasinac/appkit/client";
import type { ListingViewConfig } from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";



const SORT_OPTIONS = [
  { value: sortBy("createdAt", "DESC"), label: "Newest" },
  { value: sortBy("createdAt", "ASC"), label: "Oldest" },
];

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

interface OrdersResponse {
  items?: OrderDoc[];
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const STATUS_VARIANT: Record<string, "active" | "pending" | "danger" | "info" | "admin"> = {
  PENDING: "pending",
  PROCESSING: "pending",
  SHIPPED: "info",
  DELIVERED: "active",
  CANCELLED: "danger",
};

function UserPrizeDrawsPageInner() {
  const sideTable = useUrlTable({ defaults: { sort: sortBy("createdAt", "DESC") } });

  const config: ListingViewConfig<OrdersResponse, OrderDoc> = {
    portal: "user",
    title: "My Prize Draws",
    searchPlaceholder: "Search prize draws…",
    emptyLabel: "You haven't entered any prize draws yet.",
    filterKeys: [],
    defaultSort: sortBy("createdAt", "DESC"),
    queryKey: ["user", "prize-draws", "listing"],
    endpoint: `${API_ROUTES.USER.ORDERS}?pageSize=50`,
    sortOptions: SORT_OPTIONS,
    hideTableView: true,
    mapRows: (response) => {
      const q = (sideTable.get("q") || "").trim().toLowerCase();
      const sort = sideTable.get("sort") || SORT_OPTIONS[0].value;
      const base = (response.items ?? []).filter((o) =>
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
    },
    getTotal: (_response, rows) => rows.length,
    buildFilters: () => undefined,
    renderCards: (rows, _view, _selection, isLoading) => {
      if (isLoading) {
        return (
          <Stack gap="md">
            {Array.from({ length: 3 }).map((_, i) => (
              <Div key={i} className="h-20 animate-pulse border border-[var(--appkit-color-border)]" rounded="xl" />
            ))}
          </Stack>
        );
      }
      if (rows.length === 0) {
        return (
          <Div padding="y-6xl" className="text-center">
            <Text variant="secondary">You haven&apos;t entered any prize draws yet.</Text>
            <Link
              href={String(ROUTES.PUBLIC.PRIZE_DRAWS)}
              className="mt-3 inline-block text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-primary)] hover:underline"
            >
              Browse prize draws
            </Link>
          </Div>
        );
      }
      return (
        <Stack gap="md">
          {rows.map((order) => {
            const drawItems = order.items.filter((item) => item.listingType === "prize-draw");
            const date = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
              : "";
            const statusVariant = STATUS_VARIANT[order.status] ?? "pending";
            return (
              <Div padding="5" key={order.id} className="border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)]" rounded="xl" shadow="sm">
                <Row justify="between" align="start" gap="3">
                  <Stack className="min-w-0" gap="xs">
                    <Link
                      href={String(ROUTES.USER.ORDER_DETAIL(order.id))}
                      className="text-[length:var(--appkit-text-sm)] font-semibold text-[var(--appkit-color-text)] hover:underline"
                    >
                      Order #{order.id}
                    </Link>
                    <Text variant="secondary" size="xs">{date}</Text>
                  </Stack>
                  <Badge variant={statusVariant} className="shrink-0 capitalize">
                    {order.status.toLowerCase()}
                  </Badge>
                </Row>
                <Stack gap="xs" className="mt-3 border-t border-[var(--appkit-color-border-subtle)]" padding="t-sm">
                  {drawItems.map((item, idx) => (
                    <Row key={idx} justify="between">
                      <Link
                        href={String(ROUTES.PUBLIC.PRIZE_DRAW_DETAIL(item.productId))}
                        className="text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-text)] hover:underline line-clamp-1"
                      >
                        {item.productTitle}
                        {item.quantity > 1 ? ` — ${item.quantity} entries` : " — 1 entry"}
                      </Link>
                      <Text className="text-[var(--appkit-color-text)] shrink-0 ml-2" size="sm" weight="medium">
                        {formatAmount(item.price * item.quantity)}
                      </Text>
                    </Row>
                  ))}
                </Stack>
              </Div>
            );
          })}
        </Stack>
      );
    },
  };

  return <DataListingView config={config} />;
}

/*
 * Page-level Suspense. `export const dynamic` is a SERVER route-segment
 * config and has NO effect in a "use client" file, so it cannot make this
 * page dynamic — the client tree below reaches useSearchParams(), which
 * throws during prerender without a boundary (Root Cause #17). The dashboard
 * layout wraps {children} in Suspense too, and empirically that is not enough
 * for a client PAGE component.
 */
export default function UserPrizeDrawsPage() {
  return (
    <Suspense>
      <UserPrizeDrawsPageInner />
    </Suspense>
  );
}
