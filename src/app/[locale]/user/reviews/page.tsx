"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import {
  sortBy,
  useSession,
  useUrlTable,
  ROUTES,
  Div,
  Heading,
  Span,
  Text,
  Stack,
  Row,
} from "@mohasinac/appkit/client";
import { FieldSelect, ListingToolbar } from "@mohasinac/appkit/ui";

const __P = {
  p5: "p-5",
} as const;

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
const CLS_STAR_ON = "text-star";
const CLS_STAR_OFF = "text-zinc-300 dark:text-zinc-600";
const CLS_REPLY_BADGE = "rounded-full bg-info-surface text-info px-2 py-0.5 text-xs font-medium";

const SORT_OPTIONS = [
  { value: sortBy("createdAt", "DESC"), label: "Newest" },
  { value: sortBy("createdAt", "ASC"),  label: "Oldest" },
  { value: sortBy("rating", "DESC"),    label: "Highest rated" },
  { value: sortBy("rating", "ASC"),     label: "Lowest rated" },
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
          className={`${i < rating ? CLS_STAR_ON : CLS_STAR_OFF}`} size="base"
        >
          ★
        </Text>
      ))}
      <Text as="span" className="ml-1" color="muted" size="xs">
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
    <Stack className="w-full" gap="lg">
      <Div>
        <Heading level={1} size="2xl" weight="semibold" color="primary">
          My Reviews
        </Heading>
        {!loading && data && (
          <Text variant="secondary" className="mt-0.5" size="sm">
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
        <FieldSelect
          name="status"
          aria-label="Filter by review status"
          value={status}
          onChange={(v) => table.set("status", v)}
          options={STATUS_OPTIONS}
        />
      </Div>

      {loading ? (
        <Stack gap="md">
          {Array.from({ length: 3 }).map((_, i) => (
            <Stack key={i} className={`animate-pulse ${__P.p5}`} gap="3" rounded="xl" border="default">
              <Div className="h-4 w-1/3" surface="subtle" rounded="default" />
              <Div className="h-3 w-1/2" surface="subtle" rounded="default" />
              <Div className="h-3 w-full" surface="subtle" rounded="default" />
            </Stack>
          ))}
        </Stack>
      ) : reviews.length === 0 ? (
        <Div padding="y-6xl" className="text-center">
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
              <Stack
                key={review.id}
                surface="card"
                padding="md" gap="3">
                <Row justify="between" wrap align="start" gap="3">
                  <Stack className="min-w-0" gap="xs">
                    <Link href={productHref} className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:underline line-clamp-1">
                      {review.productTitle}
                    </Link>
                    {review.storeName && (
                      <Text variant="secondary" size="xs">
                        {review.storeName}
                      </Text>
                    )}
                  </Stack>
                  <Row gap="sm" className="shrink-0">
                    {review.verified && (
                      <Text as="span" className={CLS_REPLY_BADGE}>
                        Verified
                      </Text>
                    )}
                    <Span rounded="full" padding="pill-sm" transform="capitalize" className={statusColor} size="xs" weight="medium">
                      {review.status}
                    </Span>
                  </Row>
                </Row>
                <StarDisplay rating={review.rating} />
                <Div>
                  <Text size="sm" weight="medium" color="primary">{review.title}</Text>
                  <Text variant="secondary" className="mt-1 line-clamp-3" size="sm">{review.comment}</Text>
                </Div>
                <Row justify="between" padding="t-2xs">
                  <Text variant="secondary" size="xs">{date}</Text>
                  {review.helpfulCount > 0 && (
                    <Text variant="secondary" size="xs">
                      {review.helpfulCount} found helpful
                    </Text>
                  )}
                </Row>
              </Stack>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
