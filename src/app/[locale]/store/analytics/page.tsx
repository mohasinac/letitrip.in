"use client";
import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { SellerAnalyticsView, SellerAnalyticsStats, SellerTopProducts, Div, Text, apiClient, formatCurrency } from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";



const __P = {
  p4: "p-[var(--appkit-space-4)]",
} as const;

interface AnalyticsData {
  summary?: {
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    publishedProducts: number;
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

  const summary = data?.summary ?? {
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    publishedProducts: 0,
  };
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
          <SellerAnalyticsStats
            summary={summary}
            formatRevenue={formatCurrency}
          />
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
