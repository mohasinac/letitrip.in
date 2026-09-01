"use client";

import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import {
  sortBy,
  useUrlTable,
  ROUTES,
  Div,
  Span,
  Text,
  Stack,
  Row,
  Badge,
  DataListingView,
} from "@mohasinac/appkit/client";
import type { ListingViewConfig } from "@mohasinac/appkit/client";
import { FieldSelect } from "@mohasinac/appkit/ui";
import { API_ROUTES } from "@/constants";



const SORT_OPTIONS = [
  { value: sortBy("submittedAt", "DESC"), label: "Newest" },
  { value: "submittedAt", label: "Oldest" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
  { value: "flagged", label: "Flagged" },
  { value: "rejected", label: "Rejected" },
];

interface EventDoc {
  id: string;
  title: string;
  type: string;
  status: string;
}

interface EntryItem {
  id: string;
  eventId: string;
  reviewStatus: string;
  submittedAt: string | Date;
  spinUsed?: boolean;
  spinPrizeCouponCode?: string | null;
  points?: number;
  event: EventDoc | null;
}

interface EntriesResponse {
  items?: EntryItem[];
}

const REVIEW_STATUS_VARIANT: Record<string, "active" | "pending" | "danger" | "info"> = {
  approved: "active",
  pending: "pending",
  flagged: "danger",
  rejected: "danger",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  sale: "Sale",
  offer: "Offer",
  poll: "Poll",
  survey: "Survey",
  feedback: "Feedback",
  raffle: "Raffle",
  spin_wheel: "Spin Wheel",
};

function UserEventsPageInner() {
  const sideTable = useUrlTable({ defaults: { sort: sortBy("submittedAt", "DESC") } });

  const config: ListingViewConfig<EntriesResponse, EntryItem> = {
    portal: "user",
    title: "My Events",
    searchPlaceholder: "Search your event entries…",
    emptyLabel: "You haven't entered any events yet.",
    filterKeys: ["status"],
    defaultSort: sortBy("submittedAt", "DESC"),
    queryKey: ["user", "events", "listing"],
    endpoint: API_ROUTES.USER.EVENTS,
    sortOptions: SORT_OPTIONS,
    hideTableView: true,
    mapRows: (response) => {
      const q = (sideTable.get("q") || "").trim().toLowerCase();
      const status = sideTable.get("status") || "";
      const sort = sideTable.get("sort") || SORT_OPTIONS[0].value;
      const all = response.items ?? [];
      const filtered = all
        .filter((e) => (status ? e.reviewStatus === status : true))
        .filter((e) =>
          q ? e.event?.title?.toLowerCase().includes(q) || e.eventId.toLowerCase().includes(q) : true,
        );
      return [...filtered].sort((a, b) =>
        sort === "submittedAt"
          ? +new Date(a.submittedAt) - +new Date(b.submittedAt)
          : +new Date(b.submittedAt) - +new Date(a.submittedAt),
      );
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
              <Div key={i} className="h-20 animate-pulse border border-[var(--appkit-color-border)]" rounded="xl" />
            ))}
          </Stack>
        );
      }
      if (rows.length === 0) {
        return (
          <Div padding="y-6xl" className="text-center">
            <Text variant="secondary">You haven&apos;t entered any events yet.</Text>
            <Link
              href={String(ROUTES.PUBLIC.EVENTS)}
              className="mt-3 inline-block text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-primary)] hover:underline"
            >
              Browse events
            </Link>
          </Div>
        );
      }
      return (
        <Stack gap="md">
          {rows.map((entry) => {
            const event = entry.event;
            const date = entry.submittedAt
              ? new Date(entry.submittedAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
              : "";
            const statusVariant = REVIEW_STATUS_VARIANT[entry.reviewStatus] ?? "pending";
            const eventType = event ? EVENT_TYPE_LABELS[event.type] ?? event.type : "";
            return (
              <Div padding="5" key={entry.id} className="border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)]" rounded="xl" shadow="sm">
                <Row justify="between" align="start" gap="3">
                  <Stack className="min-w-0" gap="xs">
                    {event ? (
                      <Link
                        href={String(ROUTES.PUBLIC.EVENT_DETAIL(entry.eventId))}
                        className="text-[length:var(--appkit-text-sm)] font-semibold text-[var(--appkit-color-text)] hover:underline line-clamp-1"
                      >
                        {event.title}
                      </Link>
                    ) : (
                      <Text className="text-[var(--appkit-color-text)]" size="sm" weight="semibold">
                        Event #{entry.eventId}
                      </Text>
                    )}
                    <Row gap="xs" wrap>
                      {eventType && (
                        <Span size="xs" className="bg-[var(--appkit-color-border-subtle)] text-[var(--appkit-color-text-muted)]" rounded="full" padding="pill-xs">
                          {eventType}
                        </Span>
                      )}
                      <Text variant="secondary" size="xs">{date}</Text>
                    </Row>
                  </Stack>
                  <Badge variant={statusVariant} className="shrink-0 capitalize">
                    {entry.reviewStatus}
                  </Badge>
                </Row>
                {(entry.points !== undefined || entry.spinUsed) && (
                  <Row gap="md" className="mt-3 border-t border-[var(--appkit-color-border-subtle)]" padding="t-sm" wrap>
                    {entry.points !== undefined && (
                      <Text variant="secondary" size="xs">
                        Points: <Span weight="medium" className="text-[var(--appkit-color-text)]">{entry.points}</Span>
                      </Text>
                    )}
                    {entry.spinUsed && (
                      <Text variant="secondary" size="xs">
                        Spin:{" "}
                        <Span weight="medium" className="text-[var(--appkit-color-text)]">
                          {entry.spinPrizeCouponCode ? `Won — ${entry.spinPrizeCouponCode}` : "No prize"}
                        </Span>
                      </Text>
                    )}
                  </Row>
                )}
              </Div>
            );
          })}
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
 * throws during prerender without a boundary (Root Cause #17). The dashboard
 * layout wraps {children} in Suspense too, and empirically that is not enough
 * for a client PAGE component.
 */
export default function UserEventsPage() {
  return (
    <Suspense>
      <UserEventsPageInner />
    </Suspense>
  );
}
