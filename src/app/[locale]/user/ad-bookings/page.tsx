"use client";

/**
 * D56 — the advertiser's own bookings and what is happening to them.
 *
 * 🛑 A rejection shows the moderator's NOTE, and that is the whole point of
 * requiring one. Without it the advertiser's only move is to resubmit the
 * same creative, and the moderator reviews it twice — which is why both the
 * Zod schema and `moderateAdCreative` refuse a bare rejection.
 *
 * 🛑 It never names the moderator. `moderation.reviewedBy` is a staff uid
 * and stays server-side: who rejected you is not information a self-serve
 * submitter needs, and naming an individual invites them being contacted
 * directly about a decision the business made.
 */

import * as React from "react";
import { Suspense } from "react";
import {
  Section,
  Container,
  Stack,
  Row,
  Div,
  Heading,
  Text,
  Badge,
  Button,
  QuickFormDrawer,
  useApiMutation,
  apiClient,
  adCreativeFormSchema,
  useToast,
} from "@mohasinac/appkit/client";
import { ACTIONS } from "@mohasinac/appkit/client";
import { useQuery } from "@tanstack/react-query";
import { API_ROUTES } from "@/constants/api";

interface Booking {
  id: string;
  placementId: string;
  period: string;
  priceRs: number;
  paymentState: "unpaid" | "paid" | "refunded";
  cancelledAt?: string;
  creative: { title: string; body?: string; ctaLabel?: string; ctaHref?: string };
  moderation: { state: "pending" | "approved" | "rejected"; note?: string };
}

function monthLabel(period: string): string {
  const [y, m] = period.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatRs(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/*
 * 🛑 Four states, and `cancelled` is checked FIRST.
 *
 * A cancelled booking can still carry `approved` — cancelling does not
 * un-review anything — so testing moderation first would show a dead
 * booking as live. Same ordering argument as `isAdBookingLive`.
 */
function stateBadge(b: Booking): { label: string; variant: "active" | "pending" | "danger" | "info" } {
  if (b.cancelledAt) return { label: "Cancelled", variant: "danger" };
  if (b.moderation.state === "rejected") return { label: "Needs changes", variant: "danger" };
  if (b.moderation.state === "pending") return { label: "In review", variant: "pending" };
  if (b.paymentState !== "paid") return { label: "Approved — awaiting payment", variant: "info" };
  return { label: "Live", variant: "active" };
}

/*
 * 🛑 The edit is a DRAWER, not an inline form per row.
 *
 * An inline `<Form>` inside `bookings.map(...)` cannot own form state through
 * `useFormShellState` — that is a hook, and hooks cannot be called in a loop.
 * The alternative the form rules name for a two-field edit is
 * `<QuickFormDrawer schema={...}>`, which is one component driven by which row
 * is open, so the schema is still what validates and the row count is
 * irrelevant.
 *
 * It reuses `adCreativeFormSchema` rather than restating bounds: a resubmitted
 * creative is held to exactly the limits the original booking was.
 */
const EDIT_FIELDS = [
  { name: "title", label: "Headline", type: "text" as const, required: true },
  { name: "body", label: "Body (optional)", type: "textarea" as const },
];

function AdBookingsInner() {
  const { showToast } = useToast();
  const [editing, setEditing] = React.useState<Booking | null>(null);

  const bookingsQuery = useQuery({
    queryKey: ["ads", "my-bookings"],
    queryFn: () => apiClient.get<{ bookings: Booking[] }>(API_ROUTES.ADS.BOOKINGS),
  });
  const bookings = bookingsQuery.data?.bookings ?? (bookingsQuery.isPending ? null : []);

  const cancelMutation = useApiMutation({
    errorMessage: "We could not cancel that booking.",
    mutationFn: (id: string) => apiClient.delete(API_ROUTES.ADS.BOOKING(id)),
    onSuccess: () => {
      showToast("Booking cancelled.", "success");
      void bookingsQuery.refetch();
    },
  });

  const resubmitMutation = useApiMutation({
    errorMessage: "We could not save that.",
    mutationFn: (input: { id: string; creative: Record<string, string> }) =>
      apiClient.patch(API_ROUTES.ADS.BOOKING(input.id), { creative: input.creative }),
    onSuccess: () => {
      showToast("Sent back for review.", "success");
      setEditing(null);
      void bookingsQuery.refetch();
    },
  });

  if (bookings === null) {
    return (
      <Section padding="y-xl">
        <Container>
          <Text variant="secondary">Loading your bookings…</Text>
        </Container>
      </Section>
    );
  }

  return (
    <Section padding="y-xl">
      <Container>
        <Stack gap="lg">
          <Heading level={1}>My ad bookings</Heading>

          {bookings.length === 0 && (
            <Text variant="secondary">
              You have not booked any ad slots yet.
            </Text>
          )}

          <Stack gap="md">
            {bookings.map((b) => {
              const badge = stateBadge(b);
              const isEditing = editing?.id === b.id;
              return (
                <Div
                  key={b.id}
                  padding="5"
                  rounded="xl"
                  shadow="sm"
                  className="border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)]"
                >
                  <Stack gap="sm">
                    <Row justify="between" align="start" gap="3">
                      <Stack gap="xs" className="min-w-0">
                        <Text weight="semibold">{b.creative.title}</Text>
                        <Text size="xs" variant="secondary">
                          {b.placementId} · {monthLabel(b.period)} · {formatRs(b.priceRs)}
                        </Text>
                      </Stack>
                      <Badge variant={badge.variant} className="shrink-0">
                        {badge.label}
                      </Badge>
                    </Row>

                    {/*
                      The moderator's own words, verbatim. A generic
                      "rejected" here would make the required note pointless
                      — it is required precisely so this line can exist.
                    */}
                    {b.moderation.state === "rejected" && b.moderation.note && (
                      <Div
                        padding="sm"
                        rounded="lg"
                        surface="danger-surface"
                      >
                        <Text size="sm">{b.moderation.note}</Text>
                      </Div>
                    )}

                    {!b.cancelledAt && (
                      <Row gap="sm" wrap>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setEditing(isEditing ? null : b)}
                        >
                          {isEditing ? "Close" : "Edit creative"}
                        </Button>
                        <Button
                          size="sm"
                          action={ACTIONS.ADS["cancel-ad-booking"]}
                          isLoading={cancelMutation.isPending}
                          onClick={() => cancelMutation.mutate(b.id)}
                        >
                          Cancel booking
                        </Button>
                      </Row>
                    )}

                  </Stack>
                </Div>
              );
            })}
          </Stack>
        </Stack>
      </Container>

      {/*
        One drawer for every row. Said BEFORE they edit, not after they save:
        an approved ad silently returning to review reads as a bug, and
        `resubmitAdCreative` does exactly that by design.
      */}
      <QuickFormDrawer
        isOpen={editing !== null}
        onClose={() => setEditing(null)}
        title="Edit creative"
        fields={EDIT_FIELDS}
        schema={adCreativeFormSchema}
        defaultValues={{ title: editing?.creative.title ?? "", body: editing?.creative.body ?? "" }}
        isLoading={resubmitMutation.isPending}
        submitLabel="Save and resubmit"
        onSubmit={(values) => {
          if (!editing) return;
          const title = String(values.title ?? "");
          const body = String(values.body ?? "");
          resubmitMutation.mutate({
            id: editing.id,
            creative: { title, ...(body ? { body } : {}) },
          });
        }}
        renderExtra={() => (
          <Text size="xs" variant="secondary">
            Saving a change sends the creative back for review, so it stops
            running until it is approved again.
          </Text>
        )}
      />
    </Section>
  );
}

export default function UserAdBookingsPage() {
  return (
    <Suspense>
      <AdBookingsInner />
    </Suspense>
  );
}
