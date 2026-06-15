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
  Badge,
} from "@mohasinac/appkit/client";
import { FieldSelect, ListingToolbar } from "@mohasinac/appkit/ui";
import { API_ROUTES } from "@/constants";

const SORT_OPTIONS = [
  { value: sortBy("submittedAt", "DESC"), label: "Newest" },
  { value: "submittedAt",  label: "Oldest" },
];

const STATUS_OPTIONS = [
  { value: "",         label: "All statuses" },
  { value: "approved", label: "Approved" },
  { value: "pending",  label: "Pending" },
  { value: "flagged",  label: "Flagged" },
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

const REVIEW_STATUS_VARIANT: Record<string, "active" | "pending" | "danger" | "info"> = {
  approved: "active",
  pending:  "pending",
  flagged:  "danger",
  rejected: "danger",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  sale:       "Sale",
  offer:      "Offer",
  poll:       "Poll",
  survey:     "Survey",
  feedback:   "Feedback",
  raffle:     "Raffle",
  spin_wheel: "Spin Wheel",
};

export default function UserEventsPage() {
  const { user, loading: sessionLoading } = useSession();
  const table = useUrlTable({ defaults: { pageSize: "12", sort: "-submittedAt" } });
  const search = table.get("q") ?? "";
  const status = table.get("status") ?? "";
  const sort = table.get("sort") ?? "-submittedAt";

  const { data, isLoading } = useQuery<{ items: EntryItem[] }>({
    queryKey: ["user-events"],
    queryFn: () =>
      fetch(API_ROUTES.USER.EVENTS)
        .then((r) => r.json())
        .then((r) => r.data),
    enabled: !sessionLoading && !!user,
    staleTime: 30_000,
  });

  const entries = useMemo(() => {
    const all = data?.items ?? [];
    const q = search.trim().toLowerCase();
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
  }, [data, search, status, sort]);
  const loading = sessionLoading || isLoading;
  const filterCount = status ? 1 : 0;

  return (
    <Stack className="w-full" gap="lg">
      <Div>
        <Heading level={1} className="text-[var(--appkit-color-text)]" size="2xl" weight="semibold">
          My Events
        </Heading>
        {!loading && (
          <Text variant="secondary" className="mt-0.5" size="sm">
            {entries.length} event{entries.length !== 1 ? "s" : ""} entered
          </Text>
        )}
      </Div>

      <ListingToolbar
        searchValue={search}
        searchPlaceholder="Search your event entries…"
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
            <Stack
              key={i}
              className="animate-pulse border border-[var(--appkit-color-border)] p-5" gap="3" rounded="xl"
            >
              <Div className="h-4 w-1/3 bg-[var(--appkit-color-border)]" rounded="default" />
              <Div className="h-3 w-2/3 bg-[var(--appkit-color-border)]" rounded="default" />
            </Stack>
          ))}
        </Stack>
      ) : entries.length === 0 ? (
        <Div className="py-24 text-center">
          <Text variant="secondary">You haven&apos;t entered any events yet.</Text>
          <Link
            href={String(ROUTES.PUBLIC.EVENTS)}
            className="mt-3 inline-block text-sm text-[var(--appkit-color-primary)] hover:underline"
          >
            Browse events
          </Link>
        </Div>
      ) : (
        <Stack gap="md">
          {entries.map((entry) => {
            const event = entry.event;
            const date = entry.submittedAt
              ? new Date(entry.submittedAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "";
            const statusVariant = REVIEW_STATUS_VARIANT[entry.reviewStatus] ?? "pending";
            const eventType = event ? EVENT_TYPE_LABELS[event.type] ?? event.type : "";
            return (
              <Div
                key={entry.id}
                className="border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] p-5" rounded="xl" shadow="sm"
              >
                <Row justify="between" align="start" gap="3">
                  <Stack className="min-w-0" gap="xs">
                    {event ? (
                      <Link
                        href={String(ROUTES.PUBLIC.EVENT_DETAIL(entry.eventId))}
                        className="text-sm font-semibold text-[var(--appkit-color-text)] hover:underline line-clamp-1"
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
                        <Span size="xs" className="rounded-full bg-[var(--appkit-color-border-subtle)] px-2 py-0.5 text-[var(--appkit-color-text-muted)]">
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
                          {entry.spinPrizeCouponCode
                            ? `Won — ${entry.spinPrizeCouponCode}`
                            : "No prize"}
                        </Span>
                      </Text>
                    )}
                  </Row>
                )}
              </Div>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
