"use client";

import { Suspense } from "react";
import {
  sortBy,
  useUrlTable,
  CodeRevealPanel,
  type RevealedCode,
  ROUTES,
  Div,
  Text,
  Stack,
  Row,
} from "@mohasinac/appkit/client";
import { DataListingView } from "@mohasinac/appkit/client";
import type { ListingViewConfig } from "@mohasinac/appkit/client";
import { Link } from "@/i18n/navigation";
import { API_ROUTES } from "@/constants";
import { getOrderDigitalCode } from "@/lib/api/user-client";



const __P = {
  p4: "p-[var(--appkit-space-4)]",
} as const;

const SORT_OPTIONS = [
  { value: sortBy("createdAt", "DESC"), label: "Newest" },
  { value: sortBy("createdAt", "ASC"), label: "Oldest" },
];

async function fetchOrderCode(orderId: string): Promise<RevealedCode> {
  const res = await getOrderDigitalCode(API_ROUTES.ORDERS.CODE(orderId));
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? "Could not retrieve code");
  return body.data as RevealedCode;
}

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

interface CodeRow {
  id: string;
  orderId: string;
  item: OrderItem;
  createdAt: string | Date;
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function CodeRevealRow({ item, orderId }: { item: OrderItem; orderId: string }) {
  return (
    <Stack className={`border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] ${__P.p4}`} gap="3" rounded="lg">
      <Row justify="between" align="start">
        <Stack gap="none">
          <Link
            href={String(ROUTES.PUBLIC.DIGITAL_CODE_DETAIL(item.productId))}
            className="text-[length:var(--appkit-text-sm)] font-semibold text-[var(--appkit-color-text)] hover:underline line-clamp-1"
          >
            {item.productTitle}
          </Link>
          <Text variant="secondary" size="xs">{formatAmount(item.price)}</Text>
        </Stack>
        <Link
          href={String(ROUTES.USER.ORDER_DETAIL(orderId))}
          className="text-[length:var(--appkit-text-xs)] text-[var(--appkit-color-primary)] hover:underline shrink-0"
        >
          View order
        </Link>
      </Row>
      <CodeRevealPanel orderId={orderId} fetchCode={fetchOrderCode} />
    </Stack>
  );
}

function UserDigitalCodesPageInner() {
  // Read-only side table for the live search/sort URL state — DataListingView's
  // own ListingToolbar writes "q"/"sort" to the same URL params. This endpoint
  // has no server-side search (a user's own code purchases are always a small,
  // bounded set fetched in full), so mapRows applies both client-side.
  const sideTable = useUrlTable({ defaults: { sort: sortBy("createdAt", "DESC") } });

  const config: ListingViewConfig<OrdersResponse, CodeRow> = {
    portal: "user",
    title: "My Digital Codes",
    searchPlaceholder: "Search by product or order…",
    emptyLabel: "You haven't purchased any digital codes yet.",
    filterKeys: [],
    defaultSort: sortBy("createdAt", "DESC"),
    queryKey: ["user", "digital-codes", "listing"],
    endpoint: `${API_ROUTES.USER.ORDERS}?pageSize=50`,
    sortOptions: SORT_OPTIONS,
    hideTableView: true,
    mapRows: (response) => {
      const q = (sideTable.get("q") || "").trim().toLowerCase();
      const sort = sideTable.get("sort") || SORT_OPTIONS[0].value;
      const rows: CodeRow[] = [];
      for (const order of response.items ?? []) {
        for (const item of order.items ?? []) {
          if (item.listingType !== "digital-code") continue;
          if (q && !(item.productTitle?.toLowerCase().includes(q) || order.id.toLowerCase().includes(q))) continue;
          rows.push({ id: `${order.id}-${item.productId}`, orderId: order.id, item, createdAt: order.createdAt });
        }
      }
      rows.sort((a, b) => {
        const diff = +new Date(b.createdAt) - +new Date(a.createdAt);
        return sort === sortBy("createdAt", "ASC") ? -diff : diff;
      });
      return rows;
    },
    getTotal: (_response, rows) => rows.length,
    buildFilters: () => undefined,
    renderCards: (rows, _view, _selection, isLoading) => {
      if (isLoading) {
        return (
          <Stack gap="md">
            {Array.from({ length: 3 }).map((_, i) => (
              <Div key={i} className="h-16 animate-pulse border border-[var(--appkit-color-border)]" rounded="xl" />
            ))}
          </Stack>
        );
      }
      if (rows.length === 0) {
        return (
          <Div padding="y-6xl" className="text-center">
            <Text variant="secondary">You haven&apos;t purchased any digital codes yet.</Text>
            <Link
              href={String(ROUTES.PUBLIC.DIGITAL_CODES)}
              className="mt-3 inline-block text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-primary)] hover:underline"
            >
              Browse digital codes
            </Link>
          </Div>
        );
      }
      return (
        <Stack gap="sm">
          {rows.map((row) => (
            <CodeRevealRow key={row.id} item={row.item} orderId={row.orderId} />
          ))}
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
 * throws during prerender without a boundary (Root Cause #17). This boundary
 * is the fix. (This comment used to add that the dashboard layout's own
 * <Suspense> was "empirically not enough" — that was wrong; the layout's
 * boundary was being defeated by a swallowed prerender bailout, not ignored.
 * See Root Cause #89. A segment config is never the answer here, and
 * `audit-no-force-dynamic` blocks it.)
 */
export default function UserDigitalCodesPage() {
  return (
    <Suspense>
      <UserDigitalCodesPageInner />
    </Suspense>
  );
}
