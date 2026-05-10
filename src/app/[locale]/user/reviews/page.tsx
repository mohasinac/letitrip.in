"use client";
import { useState, useMemo } from "react";
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
} from "@mohasinac/appkit/client";

interface ReviewItem {
  id: string;
  productId: string;
  productTitle: string;
  storeId?: string;
  storeName?: string;
  rating: number;
  title: string;
  comment: string;
  status: string;
  verified: boolean;
  helpfulCount: number;
  createdAt: string | Date;
}

const STAR_LABELS: Record<number, string> = { 1: "Terrible", 2: "Poor", 3: "Average", 4: "Good", 5: "Excellent" };

function StarDisplay({ rating }: { rating: number }) {
  return (
    <Row gap="xs" className="items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`text-base ${i < rating ? "text-yellow-400" : "text-zinc-300 dark:text-zinc-600"}`}
        >
          ★
        </span>
      ))}
      <span className="ml-1 text-xs text-zinc-500 dark:text-zinc-400">
        {STAR_LABELS[rating] ?? ""}
      </span>
    </Row>
  );
}

const STATUS_COLORS: Record<string, string> = {
  approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  pending:  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function UserReviewsPage() {
  const { user, loading: sessionLoading } = useSession();
  const [filter, setFilter] = useState<"all" | "approved" | "pending" | "rejected">("all");

  const { data, isLoading } = useQuery<{ reviews: ReviewItem[]; total: number }>({
    queryKey: ["user-reviews"],
    queryFn: () => fetch("/api/user/reviews").then((r) => r.json()).then((r) => r.data),
    enabled: !sessionLoading && !!user,
    staleTime: 30_000,
  });

  const reviews = useMemo(() => {
    const all = data?.reviews ?? [];
    if (filter === "all") return all;
    return all.filter((r) => r.status === filter);
  }, [data, filter]);

  const loading = sessionLoading || isLoading;

  const tabs = [
    { key: "all",      label: "All" },
    { key: "approved", label: "Published" },
    { key: "pending",  label: "Pending" },
    { key: "rejected", label: "Rejected" },
  ] as const;

  return (
    <Div className="w-full max-w-3xl space-y-6">
      <Div>
        <Heading level={1} className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          My Reviews
        </Heading>
        {!loading && data && (
          <Text variant="secondary" className="text-sm mt-0.5">
            {data.total} review{data.total !== 1 ? "s" : ""}
          </Text>
        )}
      </Div>

      {/* Tab filter */}
      <Row gap="sm" className="flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-primary text-white"
                : "bg-zinc-100 dark:bg-slate-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </Row>

      {loading ? (
        <Stack gap="md">
          {Array.from({ length: 3 }).map((_, i) => (
            <Div key={i} className="animate-pulse rounded-xl border border-zinc-200 dark:border-slate-700 p-5 space-y-3">
              <Div className="h-4 w-1/3 rounded bg-zinc-200 dark:bg-slate-700" />
              <Div className="h-3 w-1/2 rounded bg-zinc-200 dark:bg-slate-700" />
              <Div className="h-3 w-full rounded bg-zinc-200 dark:bg-slate-700" />
            </Div>
          ))}
        </Stack>
      ) : reviews.length === 0 ? (
        <Div className="py-24 text-center">
          <Text variant="secondary">
            {filter === "all" ? "You haven't written any reviews yet." : `No ${filter} reviews.`}
          </Text>
        </Div>
      ) : (
        <Stack gap="md">
          {reviews.map((review) => {
            const date = review.createdAt
              ? new Date(review.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
              : "";
            const statusColor = STATUS_COLORS[review.status] ?? "bg-zinc-100 text-zinc-600";
            const productHref = String(ROUTES.PUBLIC.PRODUCT_DETAIL(review.productId));
            return (
              <Div
                key={review.id}
                className="rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-3"
              >
                <Row justify="between" wrap align="start" gap="3">
                  <Div className="space-y-1 min-w-0">
                    <Link href={productHref} className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:underline line-clamp-1">
                      {review.productTitle}
                    </Link>
                    {review.storeName && (
                      <Text variant="secondary" className="text-xs">
                        {review.storeName}
                      </Text>
                    )}
                  </Div>
                  <Row gap="sm" className="shrink-0 items-center">
                    {review.verified && (
                      <span className="rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 text-xs font-medium">
                        Verified
                      </span>
                    )}
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColor}`}>
                      {review.status}
                    </span>
                  </Row>
                </Row>
                <StarDisplay rating={review.rating} />
                <Div>
                  <Text className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{review.title}</Text>
                  <Text variant="secondary" className="text-sm mt-1 line-clamp-3">{review.comment}</Text>
                </Div>
                <Row justify="between" className="pt-1">
                  <Text variant="secondary" className="text-xs">{date}</Text>
                  {review.helpfulCount > 0 && (
                    <Text variant="secondary" className="text-xs">
                      {review.helpfulCount} found helpful
                    </Text>
                  )}
                </Row>
              </Div>
            );
          })}
        </Stack>
      )}
    </Div>
  );
}
