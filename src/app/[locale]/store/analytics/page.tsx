"use client";
import { useEffect, useState } from "react";
import { SellerAnalyticsView, SellerAnalyticsStats, SellerTopProducts, Div, Text } from "@mohasinac/appkit/client";
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
  const [data, setData] = useState<AnalyticsData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(API_ROUTES.STORE.ANALYTICS)
      .then((r) => r.json())
      .then((json) => {
        if (!json?.data) throw new Error("No data");
        setData(json.data);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const summary = data.summary ?? {
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    publishedProducts: 0,
  };

  return (
    <SellerAnalyticsView
      labels={{ title: "Store Analytics" }}
      isLoading={loading}
      renderStats={() =>
        error ? (
          <Div className={`${__P.p4} rounded-lg border border-[var(--appkit-color-border)]`}>
            <Text className="text-sm text-[var(--appkit-color-text-muted)]">
              {error === "Analytics service not configured"
                ? "Analytics service is not configured yet. Check back after your first orders."
                : `Could not load analytics: ${error}`}
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
        data.topProducts && data.topProducts.length > 0 ? (
          <SellerTopProducts products={data.topProducts} formatRevenue={(v) => rupees(v)} />
        ) : null
      }
    />
  );
}
