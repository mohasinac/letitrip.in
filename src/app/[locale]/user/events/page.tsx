"use client";
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
  Badge,
} from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants/api";

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

  const { data, isLoading } = useQuery<{ items: EntryItem[] }>({
    queryKey: ["user-events"],
    queryFn: () =>
      fetch(API_ROUTES.USER.EVENTS)
        .then((r) => r.json())
        .then((r) => r.data),
    enabled: !sessionLoading && !!user,
    staleTime: 30_000,
  });

  const entries = data?.items ?? [];
  const loading = sessionLoading || isLoading;

  return (
    <Div className="w-full max-w-3xl space-y-6">
      <Div>
        <Heading level={1} className="text-2xl font-semibold text-[var(--appkit-color-text)]">
          My Events
        </Heading>
        {!loading && (
          <Text variant="secondary" className="text-sm mt-0.5">
            {entries.length} event{entries.length !== 1 ? "s" : ""} entered
          </Text>
        )}
      </Div>

      {loading ? (
        <Stack gap="md">
          {Array.from({ length: 3 }).map((_, i) => (
            <Div
              key={i}
              className="animate-pulse rounded-xl border border-[var(--appkit-color-border)] p-5 space-y-3"
            >
              <Div className="h-4 w-1/3 rounded bg-[var(--appkit-color-border)]" />
              <Div className="h-3 w-2/3 rounded bg-[var(--appkit-color-border)]" />
            </Div>
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
                className="rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] p-5 shadow-sm"
              >
                <Row justify="between" align="start" gap="3">
                  <Div className="space-y-1 min-w-0">
                    {event ? (
                      <Link
                        href={String(ROUTES.PUBLIC.EVENT_DETAIL(entry.eventId))}
                        className="text-sm font-semibold text-[var(--appkit-color-text)] hover:underline line-clamp-1"
                      >
                        {event.title}
                      </Link>
                    ) : (
                      <Text className="text-sm font-semibold text-[var(--appkit-color-text)]">
                        Event #{entry.eventId}
                      </Text>
                    )}
                    <Row gap="xs" className="flex-wrap">
                      {eventType && (
                        <span className="text-xs rounded-full bg-[var(--appkit-color-border-subtle)] px-2 py-0.5 text-[var(--appkit-color-text-muted)]">
                          {eventType}
                        </span>
                      )}
                      <Text variant="secondary" className="text-xs">{date}</Text>
                    </Row>
                  </Div>
                  <Badge variant={statusVariant} className="shrink-0 capitalize">
                    {entry.reviewStatus}
                  </Badge>
                </Row>
                {(entry.points !== undefined || entry.spinUsed) && (
                  <Row gap="md" className="mt-3 pt-3 border-t border-[var(--appkit-color-border-subtle)] flex-wrap">
                    {entry.points !== undefined && (
                      <Text variant="secondary" className="text-xs">
                        Points: <span className="font-medium text-[var(--appkit-color-text)]">{entry.points}</span>
                      </Text>
                    )}
                    {entry.spinUsed && (
                      <Text variant="secondary" className="text-xs">
                        Spin:{" "}
                        <span className="font-medium text-[var(--appkit-color-text)]">
                          {entry.spinPrizeCouponCode
                            ? `Won — ${entry.spinPrizeCouponCode}`
                            : "No prize"}
                        </span>
                      </Text>
                    )}
                  </Row>
                )}
              </Div>
            );
          })}
        </Stack>
      )}
    </Div>
  );
}
