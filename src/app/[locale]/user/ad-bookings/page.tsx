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
  Form,
  FieldInput,
  FieldTextarea,
  useToast,
} from "@mohasinac/appkit/client";
import { ACTIONS } from "@mohasinac/appkit/client";
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

function AdBookingsInner() {
  const { showToast } = useToast();
  const [bookings, setBookings] = React.useState<Booking[] | null>(null);
  const [editing, setEditing] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    const res = await fetch(API_ROUTES.ADS.BOOKINGS);
    const json = (await res.json().catch(() => ({}))) as { data?: { bookings?: Booking[] } };
    setBookings(json.data?.bookings ?? []);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

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
              const isEditing = editing === b.id;
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
                          onClick={() => {
                            setEditing(isEditing ? null : b.id);
                            setTitle(b.creative.title);
                            setBody(b.creative.body ?? "");
                          }}
                        >
                          {isEditing ? "Close" : "Edit creative"}
                        </Button>
                        <Button
                          size="sm"
                          action={ACTIONS.ADS["cancel-ad-booking"]}
                          onClick={async () => {
                            await fetch(API_ROUTES.ADS.BOOKING(b.id), { method: "DELETE" });
                            showToast("Booking cancelled.", "success");
                            await load();
                          }}
                        >
                          Cancel booking
                        </Button>
                      </Row>
                    )}

                    {isEditing && (
                      <Form onSubmit={(e) => e.preventDefault()} className="space-y-3">
                        {({ setFieldError, clearErrors }) => (
                          <>
                            {/*
                              Said before they edit. An approved ad silently
                              going back into review after a save reads as a
                              bug; stated here it is the rule.
                            */}
                            <Text size="xs" variant="secondary">
                              Saving a change sends the creative back for review, so
                              it stops running until it is approved again.
                            </Text>
                            <FieldInput
                              name="title"
                              label="Headline"
                              required
                              value={title}
                              onChange={setTitle}
                            />
                            <FieldTextarea
                              name="body"
                              label="Body (optional)"
                              value={body}
                              onChange={setBody}
                            />
                            <Button
                              type="submit"
                              isLoading={isSaving}
                              onClick={async () => {
                                clearErrors();
                                setIsSaving(true);
                                try {
                                  const res = await fetch(API_ROUTES.ADS.BOOKING(b.id), {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      creative: { title, ...(body ? { body } : {}) },
                                    }),
                                  });
                                  if (!res.ok) {
                                    setFieldError(
                                      "title",
                                      "We could not save that. Check the fields and try again.",
                                    );
                                    return;
                                  }
                                  showToast("Sent back for review.", "success");
                                  setEditing(null);
                                  await load();
                                } finally {
                                  setIsSaving(false);
                                }
                              }}
                            >
                              Save and resubmit
                            </Button>
                          </>
                        )}
                      </Form>
                    )}
                  </Stack>
                </Div>
              );
            })}
          </Stack>
        </Stack>
      </Container>
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
