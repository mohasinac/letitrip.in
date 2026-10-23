"use client";

/**
 * D56 — the creative moderation queue.
 *
 * 🛑 The creative is RENDERED here, not summarised. A moderator approving a
 * row that shows only a headline and a placement id is acting blind — the
 * exact shape Root Cause #56 calls out, where a listing offers mutations on
 * a record nobody was ever able to read. The thing being judged has to be
 * on the screen.
 *
 * 🛑 Rejection REQUIRES a note and the control enforces it client-side as
 * well as server-side. Not because the client check is the guarantee — it
 * is not, `moderateAdCreative` refuses a bare rejection regardless — but
 * because discovering the requirement as a 400 after writing nothing is a
 * worse way to learn it than a disabled button that says so.
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
  Button,
  FieldTextarea,
  MediaImage,
  useApiMutation,
  apiClient,
  useToast,
} from "@mohasinac/appkit/client";
import { ACTIONS } from "@mohasinac/appkit/client";
import { useQuery } from "@tanstack/react-query";
import { ADMIN_ENDPOINTS } from "@mohasinac/appkit/constants/api-endpoints";

interface PendingBooking {
  id: string;
  placementId: string;
  period: string;
  priceRs: number;
  advertiserName?: string;
  creative: { title: string; body?: string; imageUrl?: string; ctaLabel?: string; ctaHref?: string };
}

function monthLabel(period: string): string {
  const [y, m] = period.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

const MIN_REJECTION_NOTE = 10;

function AdModerationInner() {
  const { showToast } = useToast();
  const [notes, setNotes] = React.useState<Record<string, string>>({});
  const [busy, setBusy] = React.useState<string | null>(null);

  const queueQuery = useQuery({
    queryKey: ["admin", "ad-bookings", "pending"],
    queryFn: () => apiClient.get<{ bookings: PendingBooking[] }>(ADMIN_ENDPOINTS.AD_BOOKINGS),
  });
  const rows = queueQuery.data?.bookings ?? (queueQuery.isPending ? null : []);

  const moderateMutation = useApiMutation({
    errorMessage: "That did not save — try again.",
    mutationFn: (input: { id: string; approve: boolean; note?: string }) =>
      apiClient.post(ADMIN_ENDPOINTS.AD_BOOKING_MODERATE(input.id), {
        approve: input.approve,
        ...(input.note ? { note: input.note } : {}),
      }),
    onSuccess: (_data, input) => {
      showToast(input.approve ? "Approved." : "Rejected and sent back.", "success");
      void queueQuery.refetch();
    },
    /* `busy` drives the per-row spinner, so it must clear on BOTH paths —
     * a failed moderation that leaves one row spinning forever reads as a
     * hung request rather than a refused one. */
    onSettled: () => setBusy(null),
  });

  const moderate = React.useCallback(
    (id: string, approve: boolean) => {
      setBusy(id);
      const note = notes[id]?.trim() ?? "";
      moderateMutation.mutate({ id, approve, ...(note ? { note } : {}) });
    },
    [notes, moderateMutation],
  );

  if (rows === null) {
    return (
      <Section padding="y-xl">
        <Container>
          <Text variant="secondary">Loading the queue…</Text>
        </Container>
      </Section>
    );
  }

  return (
    <Section padding="y-xl">
      <Container>
        <Stack gap="lg">
          <Stack gap="xs">
            <Heading level={1}>Ad review</Heading>
            <Text variant="secondary">
              Self-serve creatives awaiting approval. Nothing here renders on the
              site until it is approved.
            </Text>
          </Stack>

          {rows.length === 0 && <Text variant="secondary">Nothing waiting for review.</Text>}

          <Stack gap="md">
            {rows.map((b) => {
              const note = notes[b.id] ?? "";
              const canReject = note.trim().length >= MIN_REJECTION_NOTE;
              return (
                <Div
                  key={b.id}
                  padding="5"
                  rounded="xl"
                  shadow="sm"
                  className="border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)]"
                >
                  <Stack gap="md">
                    <Text size="xs" variant="secondary">
                      {b.placementId} · {monthLabel(b.period)}
                      {b.advertiserName ? ` · ${b.advertiserName}` : ""}
                    </Text>

                    {/* The creative itself — this is what is being judged. */}
                    <Div
                      padding="md"
                      rounded="lg"
                      surface="muted"
                    >
                      <Stack gap="xs">
                        {b.creative.imageUrl && (
                          <MediaImage
                            src={b.creative.imageUrl}
                            alt={b.creative.title}
                            size="card"
                          />
                        )}
                        <Text weight="semibold">{b.creative.title}</Text>
                        {b.creative.body && <Text size="sm">{b.creative.body}</Text>}
                        {b.creative.ctaHref && (
                          <Text size="xs" variant="secondary">
                            {b.creative.ctaLabel || "Link"} → {b.creative.ctaHref}
                          </Text>
                        )}
                      </Stack>
                    </Div>

                    <FieldTextarea
                      name={`note-${b.id}`}
                      label="Note to the advertiser (required to reject)"
                      value={note}
                      onChange={(v: string) => setNotes((prev) => ({ ...prev, [b.id]: v }))}
                    />

                    <Row gap="sm" wrap>
                      <Button
                        size="sm"
                        isLoading={busy === b.id}
                        action={ACTIONS.ADS["approve-ad-creative"]}
                        onClick={() => moderate(b.id, true)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        /*
                         * Disabled rather than hidden, with the reason on the
                         * field's own label. A missing control reads as "you
                         * cannot reject this"; a disabled one beside a label
                         * saying a note is required reads as the instruction
                         * it is.
                         */
                        disabled={!canReject || busy === b.id}
                        action={ACTIONS.ADS["reject-ad-creative"]}
                        onClick={() => moderate(b.id, false)}
                      >
                        Reject
                      </Button>
                    </Row>
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

export default function AdminAdBookingsPage() {
  return (
    <Suspense>
      <AdModerationInner />
    </Suspense>
  );
}
