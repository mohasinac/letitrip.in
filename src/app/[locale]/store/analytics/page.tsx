"use client";
import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { SellerAnalyticsView, SellerTopProducts, Div, Text, apiClient, formatCurrency } from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";



const __P = {
  p4: "p-[var(--appkit-space-4)]",
} as const;

/*
 * Tiles are rendered here rather than through `SellerAnalyticsStats`.
 *
 * That component hard-codes FOUR tiles — revenue, orders, total products,
 * published products — and `/api/store/analytics` only ever computes three
 * values. Passing it the real response left two tiles reading `undefined`.
 *
 * The alternatives were worse: sending `0` for the two it cannot supply is a
 * confident lie (the store has 15 products), and widening the route to count
 * products would spend Firestore reads per request against Rule #6 for numbers
 * the store dashboard already shows. So the page renders exactly what the
 * endpoint measures and nothing more.
 */
function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Div
      className={`${__P.p4} border border-[var(--appkit-color-border)]`}
      rounded="lg"
      surface="card"
    >
      <Text className="text-[var(--appkit-color-text-muted)] uppercase" size="xs" weight="medium">
        {label}
      </Text>
      <Text className="mt-[var(--appkit-space-1)]" size="2xl" weight="bold">
        {value}
      </Text>
    </Div>
  );
}

/*
 * 🛑 This MUST match what `/api/store/analytics` actually returns.
 *
 * It declared `{ totalOrders, totalRevenue, totalProducts, publishedProducts }`
 * while the route has only ever returned `{ revenue, orders, aov }`. Because
 * `data.summary` was truthy, the `?? { …: 0 }` fallback below never fired, every
 * lookup resolved to `undefined`, and the page rendered four tiles reading
 * `₹NaN`, `undefined`, `undefined`, `undefined` — live, to sellers.
 *
 * `totalProducts` / `publishedProducts` are NOT reinstated here: the route does
 * not compute them, and adding two collection counts to a per-request handler
 * would spend Firestore reads against Rule #6's budget for numbers the seller
 * already sees on the store dashboard. `aov` is what the route genuinely has.
 */
interface AnalyticsData {
  summary?: {
    revenue: number;
    orders: number;
    aov: number;
  };
  topProducts?: Array<{
    productId: string;
    title: string;
    revenue: number;
    orders: number;
    mainImage?: string;
  }>;
}

function PageInner() {
  const { data, isPending, error } = useQuery<AnalyticsData>({
    queryKey: ["store-analytics"],
    queryFn: () => apiClient.get<AnalyticsData>(API_ROUTES.STORE.ANALYTICS),
    staleTime: 60_000,
  });

  const summary = data?.summary ?? { revenue: 0, orders: 0, aov: 0 };
  const errorMessage = error instanceof Error ? error.message : null;

  return (
    <SellerAnalyticsView
      labels={{ title: "Store Analytics" }}
      isLoading={isPending}
      renderStats={() =>
        errorMessage ? (
          <Div className={`${__P.p4} border border-[var(--appkit-color-border)]`} rounded="lg">
            <Text className="text-[var(--appkit-color-text-muted)]" size="sm">
              {errorMessage === "Analytics service not configured"
                ? "Analytics service is not configured yet. Check back after your first orders."
                : `Could not load analytics: ${errorMessage}`}
            </Text>
          </Div>
        ) : (
          <Div layout="grid" gap="4" className="grid-cols-1 sm:grid-cols-3">
            <StatTile label="Revenue (30d)" value={formatCurrency(summary.revenue)} />
            <StatTile label="Orders (30d)" value={String(summary.orders)} />
            <StatTile label="Avg. order value" value={formatCurrency(summary.aov)} />
          </Div>
        )
      }
      renderTopProducts={() =>
        data?.topProducts && data.topProducts.length > 0 ? (
          <SellerTopProducts products={data.topProducts} formatRevenue={formatCurrency} />
        ) : null
      }
    />
  );
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
export default function Page() {
  return (
    <Suspense>
      <PageInner />
    </Suspense>
  );
}
