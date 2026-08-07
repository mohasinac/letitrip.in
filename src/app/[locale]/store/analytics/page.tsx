"use client";
import { useQuery } from "@tanstack/react-query";
import { SellerAnalyticsView, SellerAnalyticsStats, SellerTopProducts, Div, Text, apiClient } from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";

const __P = {
  p4: "p-4",
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

function rupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

export default function Page() {
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
            formatRevenue={(v: number) => rupees(v)}
          />
        )
      }
      renderTopProducts={() =>
        data?.topProducts && data.topProducts.length > 0 ? (
          <SellerTopProducts products={data.topProducts} formatRevenue={(v) => rupees(v)} />
        ) : null
      }
    />
  );
}
