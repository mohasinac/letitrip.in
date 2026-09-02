"use client";

import {useState, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { SellerReviewsView } from "@mohasinac/appkit/client";
import { Heading, Stack, Text, Row, Div } from "@mohasinac/appkit/client";
import { Button } from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";
import { getUserReviewsByRole } from "@/lib/api/user-client";
import { STORE_REVIEWS_ROLE_TABS, type StoreReviewsRoleTabId } from "@/constants";



interface ReviewItem {
  id: string;
  productId: string;
  productTitle: string;
  rating: number;
  title: string;
  comment: string;
  status: string;
  createdAt: string | Date;
  userName?: string;
  storeName?: string;
}

const STAR_LABELS: Record<number, string> = { 1: "Terrible", 2: "Poor", 3: "Average", 4: "Good", 5: "Excellent" };

function SimpleReviewCard({ review }: { review: ReviewItem }) {
  const date = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
    : "";
  return (
    <Stack surface="card" padding="md" gap="3" rounded="xl">
      <Row justify="between" align="start" gap="3">
        <Text size="sm" weight="semibold" color="primary" className="line-clamp-1">
          {review.productTitle}
        </Text>
        <Row gap="xs" align="center" className="shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <Text key={i} as="span" className={i < review.rating ? "text-star" : "text-zinc-300"} size="sm">
              ★
            </Text>
          ))}
          <Text as="span" color="muted" size="xs" className="ml-0.5">{STAR_LABELS[review.rating] ?? ""}</Text>
        </Row>
      </Row>
      <Div>
        <Text size="sm" weight="medium" color="primary">{review.title}</Text>
        <Text color="muted" size="sm" className="mt-1 line-clamp-3">{review.comment}</Text>
      </Div>
      <Row justify="between">
        <Text color="muted" size="xs">{date}</Text>
        {review.userName && <Text color="muted" size="xs">{review.userName}</Text>}
      </Row>
    </Stack>
  );
}

function ReviewsTab({ role }: { role: "buyer" | "seller" }) {
  const { data, isLoading } = useQuery<{ reviews: ReviewItem[] }>({
    queryKey: ["store-reviews-by-role", role],
    queryFn: () =>
      getUserReviewsByRole(role)
        .then((r) => r.json())
        .then((r) => r.data as { reviews: ReviewItem[] }),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <Stack gap="md">
        {Array.from({ length: 3 }).map((_, i) => (
          <Stack key={i} className="animate-pulse" padding="md" gap="3" border="default" rounded="xl">
            <Div className="h-4 w-1/3" surface="subtle" rounded="default" />
            <Div className="h-3 w-full" surface="subtle" rounded="default" />
          </Stack>
        ))}
      </Stack>
    );
  }

  const reviews = data?.reviews ?? [];
  if (reviews.length === 0) {
    return (
      <Div padding="y-6xl" className="text-center">
        <Text color="muted" size="sm">No reviews yet.</Text>
      </Div>
    );
  }

  return (
    <Stack gap="md">
      {reviews.map((review) => (
        <SimpleReviewCard key={review.id} review={review} />
      ))}
    </Stack>
  );
}

function StoreReviewsPageInner() {
  const [activeTab, setActiveTab] = useState<StoreReviewsRoleTabId>("received");

  return (
    <Stack gap="lg">
      <Heading level={1} size="2xl" weight="semibold" color="primary">Reviews</Heading>

      <Row gap="xs" wrap>
        {STORE_REVIEWS_ROLE_TABS.map((tab) => (
          <Button
            key={tab.id}
            type="button"
            variant={activeTab === tab.id ? "primary" : "outline"}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </Row>

      {activeTab === "received" && (
        <SellerReviewsView
          reviewsApiBase={API_ROUTES.STORE.REVIEWS}
          replyApiBase={API_ROUTES.STORE.REVIEWS}
        />
      )}
      {activeTab === "given_to_buyers" && (
        <ReviewsTab role="seller" />
      )}
      {activeTab === "written_as_customer" && (
        <ReviewsTab role="buyer" />
      )}
    </Stack>
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
export default function StoreReviewsPage() {
  return (
    <Suspense>
      <StoreReviewsPageInner />
    </Suspense>
  );
}
