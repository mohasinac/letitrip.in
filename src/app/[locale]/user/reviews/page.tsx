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
} from "@mohasinac/appkit/client";
import { ListingToolbar } from "@mohasinac/appkit/ui";

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
const CLS_STAR_ON = "text-yellow-400";
const CLS_STAR_OFF = "text-zinc-300 dark:text-zinc-600";
const CLS_REPLY_BADGE = "rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 text-xs font-medium";

const SORT_OPTIONS = [
  { value: "-createdAt", label: "Newest" },
  { value: "createdAt",  label: "Oldest" },
  { value: "-rating",    label: "Highest rated" },
  { value: "rating",     label: "Lowest rated" },
];

const STATUS_OPTIONS = [
  { value: "",         label: "All statuses" },
  { value: "approved", label: "Published" },
  { value: "pending",  label: "Pending" },
  { value: "rejected", label: "Rejected" },
];

function StarDisplay({ rating }: { rating: number }) {
  return (
    <Row gap="xs">
      {Array.from({ length: 5 }).map((_, i) => (
        <Text
          as="span"
          key={i}
          className={`text-base ${i < rating ? CLS_STAR_ON : CLS_STAR_OFF}`}
        >
          ★
        </Text>
      ))}
      <Text as="span" className="ml-1 text-xs text-zinc-500 dark:text-zinc-400">
        {STAR_LABELS[rating] ?? ""}
      </Text>
    </Row>
  );
}

const STATUS_COLORS: Record<string, string> = {
  approved: "bg-success-surface text-success",
  pending:  "bg-warning-surface text-warning",
  rejected: "bg-error-surface text-error",
};

export default function UserReviewsPage() {
  const { user, loading: sessionLoading } = useSession();
  const table = useUrlTable({ defaults: { pageSize: "12", sort: "-createdAt" } });
  const search = table.get("q") ?? "";
  const status = table.get("status") ?? "";
  const sort = table.get("sort") ?? "-createdAt";

  const { data, isLoading } = useQuery<{ reviews: ReviewItem[]; total: number }>({
    queryKey: ["user-reviews"],
    queryFn: () => fetch("/api/user/reviews").then((r) => r.json()).then((r) => r.data),
    enabled: !sessionLoading && !!user,
    staleTime: 30_000,
  });

  const reviews = useMemo(() => {
    const all = data?.reviews ?? [];
    const q = search.trim().toLowerCase();
    const filtered = all
      .filter((r) => (status ? r.status === status : true))
      .filter((r) =>
        q
          ? r.productTitle?.toLowerCase().includes(q) ||
            r.title?.toLowerCase().includes(q) ||
            r.comment?.toLowerCase().includes(q)
          : true,
      );
    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "createdAt":  return +new Date(a.createdAt) - +new Date(b.createdAt);
        case "-rating":    return b.rating - a.rating;
        case "rating":     return a.rating - b.rating;
        case "-createdAt":
        default:           return +new Date(b.createdAt) - +new Date(a.createdAt);
      }
    });
  }, [data, status, search, sort]);

  const loading = sessionLoading || isLoading;
  const filterCount = (status ? 1 : 0);

  return (
    <Div className="w-full space-y-6">
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

      <ListingToolbar
        searchValue={search}
        searchPlaceholder="Search your reviews…"
        onSearchChange={(v) => table.set("q", v)}
        sortValue={sort}
        sortOptions={SORT_OPTIONS}
        onSortChange={(v) => table.set("sort", v)}
        hideViewToggle
        filterCount={filterCount}
        hasActiveState={filterCount > 0 || !!search}
        onResetAll={() => table.clear()}
      />

      <Div>
        {/* eslint-disable-next-line lir/no-raw-html-elements -- short status filter; <Select> wrapper drops this UX */}
        <select
          value={status}
          onChange={(e) => table.set("status", e.target.value)}
          className="rounded-md border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] px-3 py-1.5 text-sm text-[var(--appkit-color-text)]"
          aria-label="Filter by review status"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </Div>

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
            {status ? `No ${status} reviews.` : "You haven't written any reviews yet."}
          </Text>
        </Div>
      ) : (
        <Stack gap="md">
          {reviews.map((review) => {
            const date = review.createdAt
              ? new Date(review.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
              : "";
            const statusColor = STATUS_COLORS[review.status] ?? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";
            const productHref = String(ROUTES.PUBLIC.PRODUCT_DETAIL(review.productId));
            return (
              <Div
                key={review.id}
                surface="card"
                padding="md"
                className="space-y-3"
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
                  <Row gap="sm" className="shrink-0">
                    {review.verified && (
                      <Text as="span" className={CLS_REPLY_BADGE}>
                        Verified
                      </Text>
                    )}
                    <Text as="span" className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColor}`}>
                      {review.status}
                    </Text>
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
