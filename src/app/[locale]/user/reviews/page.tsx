"use client";
import { Link } from "@/i18n/navigation";
import {
  sortBy,
  useUrlTable,
  pluginFor,
  Div,
  Span,
  Text,
  Stack,
  Row,
  DataListingView,
} from "@mohasinac/appkit/client";
import type { ListingType, ListingViewConfig } from "@mohasinac/appkit/client";
import { FieldSelect } from "@mohasinac/appkit/ui";
import { API_ROUTES } from "@/constants";

const __P = {
  p5: "p-[var(--appkit-space-5)]",
} as const;

interface ReviewItem {
  id: string;
  productId: string;
  productTitle: string;
  listingType?: ListingType;
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

interface ReviewsResponse {
  reviews?: ReviewItem[];
  total?: number;
}

const STAR_LABELS: Record<number, string> = { 1: "Terrible", 2: "Poor", 3: "Average", 4: "Good", 5: "Excellent" };
const CLS_STAR_ON = "text-star";
const CLS_STAR_OFF = "text-[var(--appkit-color-text-faint)]";
const CLS_REPLY_BADGE = "rounded-full bg-info-surface text-info px-[var(--appkit-space-2)] py-[var(--appkit-space-0-5)] text-[length:var(--appkit-text-xs)] font-medium";

const SORT_OPTIONS = [
  { value: sortBy("createdAt", "DESC"), label: "Newest" },
  { value: sortBy("createdAt", "ASC"), label: "Oldest" },
  { value: sortBy("rating", "DESC"), label: "Highest rated" },
  { value: sortBy("rating", "ASC"), label: "Lowest rated" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "approved", label: "Published" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
];

function StarDisplay({ rating }: { rating: number }) {
  return (
    <Row gap="xs">
      {Array.from({ length: 5 }).map((_, i) => (
        <Text as="span" key={i} className={`${i < rating ? CLS_STAR_ON : CLS_STAR_OFF}`} size="base">
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
  pending: "bg-warning-surface text-warning",
  rejected: "bg-error-surface text-error",
};

export default function UserReviewsPage() {
  const sideTable = useUrlTable({ defaults: { sort: sortBy("createdAt", "DESC") } });

  const config: ListingViewConfig<ReviewsResponse, ReviewItem> = {
    portal: "user",
    title: "My Reviews",
    searchPlaceholder: "Search your reviews…",
    emptyLabel: "You haven't written any reviews yet.",
    filterKeys: ["status"],
    defaultSort: sortBy("createdAt", "DESC"),
    queryKey: ["user", "reviews", "listing"],
    endpoint: API_ROUTES.USER.REVIEWS,
    sortOptions: SORT_OPTIONS,
    hideTableView: true,
    mapRows: (response) => {
      const q = (sideTable.get("q") || "").trim().toLowerCase();
      const status = sideTable.get("status") || "";
      const sort = sideTable.get("sort") || SORT_OPTIONS[0].value;
      const all = response.reviews ?? [];
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
          case "createdAt": return +new Date(a.createdAt) - +new Date(b.createdAt);
          case sortBy("rating", "DESC"): return b.rating - a.rating;
          case "rating": return a.rating - b.rating;
          default: return +new Date(b.createdAt) - +new Date(a.createdAt);
        }
      });
    },
    getTotal: (_response, rows) => rows.length,
    buildFilters: () => undefined,
    renderFilterPanel: ({ pendingFilters, setPendingFilters }) => (
      <FieldSelect
        name="status"
        label="Review status"
        value={pendingFilters.status || ""}
        onChange={(v) => setPendingFilters((p) => ({ ...p, status: v }))}
        options={STATUS_OPTIONS}
      />
    ),
    renderCards: (rows, _view, _selection, isLoading) => {
      if (isLoading) {
        return (
          <Stack gap="md">
            {Array.from({ length: 3 }).map((_, i) => (
              <Stack key={i} className={`animate-pulse ${__P.p5}`} gap="3" rounded="xl" border="default">
                <Div className="h-4 w-1/3" surface="subtle" rounded="default" />
                <Div className="h-3 w-1/2" surface="subtle" rounded="default" />
                <Div className="h-3 w-full" surface="subtle" rounded="default" />
              </Stack>
            ))}
          </Stack>
        );
      }
      if (rows.length === 0) {
        const status = sideTable.get("status") || "";
        return (
          <Div padding="y-6xl" className="text-center">
            <Text variant="secondary">
              {status ? `No ${status} reviews.` : "You haven't written any reviews yet."}
            </Text>
          </Div>
        );
      }
      return (
        <Stack gap="md">
          {rows.map((review) => {
            const date = review.createdAt
              ? new Date(review.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
              : "";
            const statusColor = STATUS_COLORS[review.status] ?? "bg-[var(--appkit-color-surface)] text-[var(--appkit-color-text-muted)]";
            const productHref = pluginFor(review.listingType ?? "standard").detailRoute(review.productId);
            return (
              <Stack key={review.id} surface="card" padding="md" gap="3">
                <Row justify="between" wrap align="start" gap="3">
                  <Stack className="min-w-0" gap="xs">
                    <Link href={productHref} className="text-[length:var(--appkit-text-sm)] font-semibold text-[var(--appkit-color-text)] hover:underline line-clamp-1">
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
      );
    },
  };

  return <DataListingView config={config} />;
}
