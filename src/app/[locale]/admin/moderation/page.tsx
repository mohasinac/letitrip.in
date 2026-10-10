"use client";
import { readListResponse } from "@/lib/api/read-list-response";
import { normalizeError } from "@mohasinac/appkit/client";

import {
  Container,
  Stack,
  Heading,
  Text,
  Button,
  Alert,
  EmptyState,
  Row,
  Section,
  Skeleton,
  ACTIONS,
  ROUTES,
  ReviewDecisionModal,
  moderationReviewFormSchema,
  type ModerationReviewFormValues,
} from "@mohasinac/appkit/client";
import { Link } from "@/i18n/navigation";
import { API_ROUTES } from "@/constants";
import { getAdminModerationQueue, updateAdminModeration } from "@/lib/api/admin-client";
import {useEffect, useState, Suspense } from "react";
import type { ModerationQueueDocument } from "@mohasinac/appkit/client";



function PageInner() {
  const [items, setItems] = useState<ModerationQueueDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    // Cleared on every retry — a stale error would otherwise win the render
    // branch even after a successful reload.
    setLoadError(null);
    getAdminModerationQueue(API_ROUTES.ADMIN.MODERATION_QUEUE)
      .then((r) => readListResponse<ModerationQueueDocument>(r, "the moderation queue"))
      .then(setItems)
      .catch((err) => setLoadError(normalizeError(err).message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const review = async (id: string, body: ModerationReviewFormValues) => {
    await updateAdminModeration(API_ROUTES.ADMIN.MODERATION_BY_ID(id), body);
    load();
  };

  return (
    <Section>
      <Container size="2xl">
        <Stack gap="lg" padding="y-lg">
          <Heading level={1}>Moderation Queue</Heading>
          <Text color="muted">
            Pending media awaiting review. Approving releases the asset; rejecting blocks it.
          </Text>
          {loading ? (
            <Stack gap="sm">
              <Skeleton variant="rectangular" height="64px" />
              <Skeleton variant="rectangular" height="64px" />
              <Skeleton variant="rectangular" height="64px" />
            </Stack>
          ) : loadError ? (
            // A FAILED request must not render the empty state. `errorResponse()`
            // is valid JSON with a non-2xx status, so `r.json()` resolved and
            // `?? []` produced an empty list — the page said "nothing here"
            // when it meant "the request failed". See readListResponse.
            <Alert variant="error" title="Couldn't load this list">
              {loadError} Refresh to retry.
            </Alert>
          ) : items.length === 0 ? (
            <EmptyState title="Inbox zero" description="No pending moderation." />
          ) : (
            <Stack gap="sm">
              {items.map((m) => (
                <Row
                  key={m.id} rounded="default" padding="md" border="default" align="start" justify="between">
                  <Stack gap="xs" className="flex-1 min-w-0">
                    <Text weight="medium">
                      {m.mediaType} · {m.entityType} · {m.entityId}
                    </Text>
                    <Text size="xs" color="muted">
                      Submitted by {m.ownerId} ·{" "}
                      {new Date(m.submittedAt).toLocaleString()}
                    </Text>
                    {m.mediaUrl ? (
                      <Text className="truncate" color="muted" size="xs">
                        {m.mediaUrl}
                      </Text>
                    ) : null}
                  </Stack>
                  <Row gap="sm">
                    <Link
                      href={String(ROUTES.ADMIN.MODERATION_DETAIL(m.id))}
                      className="text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-primary)] hover:underline"
                    >
                      View
                    </Link>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => review(m.id, { status: "approved" })}
                    >
                      {ACTIONS.ADMIN["approve-product"].label}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setRejectTargetId(m.id)}
                    >
                      {ACTIONS.ADMIN["reject-product"].label}
                    </Button>
                  </Row>
                </Row>
              ))}
            </Stack>
          )}
        </Stack>
      </Container>

      <ReviewDecisionModal
        isOpen={rejectTargetId !== null}
        onClose={() => setRejectTargetId(null)}
        title="Reject media"
        schema={moderationReviewFormSchema}
        status="rejected"
        noteField="reason"
        noteLabel="Reason"
        noteHelp="Required — the seller will see this note."
        notePlaceholder="Why is this asset being rejected?"
        confirmLabel={ACTIONS.ADMIN["reject-product"].label}
        confirmVariant="danger"
        onConfirm={(values) => review(rejectTargetId!, values)}
      />
    </Section>
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
export default function Page() {
  return (
    <Suspense>
      <PageInner />
    </Suspense>
  );
}
