"use client";

/**
 * ObligationsClient — what the order lifecycle is waiting on, and what is late.
 *
 * ## Why read-only, and why that is not a gap
 *
 * `obligations` is a due-date INDEX, not truth. The sweep re-reads the subject
 * and re-evaluates the policy's `precondition` before it acts, which is what
 * stops the collection becoming a stored mirror of derived state (Root Cause
 * #42) — a row saying "cancel this at 15:00" is a hint; the order saying "I was
 * paid at 14:58" is the fact, and the fact wins.
 *
 * So there is nothing useful to edit here. Changing a row would change the
 * index while the order went on saying what it says, and the next tick would
 * decide from the order — an edit that reads as having done something and
 * changed nothing. Acting early belongs on the SUBJECT: cancel the order,
 * approve the return, confirm the delivery.
 *
 * ## 🛑 No filter chips, and the absence was a decision
 *
 * `ADMIN_OBLIGATION_STATE_TABS` and `ADMIN_OBLIGATION_KIND_TABS` were written
 * and removed before shipping. The overdue query returns OPEN rows by
 * definition, so a state filter would offer five chips of which exactly one can
 * ever match; and twelve kind chips over a list that should be nearly empty is
 * noise. The two windows ARE the filter.
 *
 * ## The two windows are the two questions
 *
 * **Overdue** is `listDue(now)` — the sweep's own query, so this page cannot
 * disagree with the engine about what is due. **Upcoming** is `listUpcoming`
 * over seven days, which covers every policy window. Nothing else is worth
 * asking: an obligation is either late, nearly due, or irrelevant.
 */

import { useEffect, useState, Suspense } from "react";
import {
  Alert,
  Button,
  Container,
  EmptyState,
  Heading,
  Row,
  Section,
  Skeleton,
  Stack,
  Text,
} from "@mohasinac/appkit/client";
import { normalizeError } from "@mohasinac/appkit/client";
import { readListResponse } from "@/lib/api/read-list-response";
import { API_ROUTES } from "@/constants";

interface ObligationRow {
  id: string;
  kind: string;
  subjectId: string;
  dueAt: string;
  state: string;
  warnedAt?: string[];
}

/**
 * What each deadline is waiting on, in words an operator can act on.
 *
 * Deliberately phrased as "who owes what" rather than echoing the kind: the
 * field value is `seller-dispatch`, but the useful sentence is "the seller has
 * not posted this yet".
 */
const KIND_LABEL: Record<string, string> = {
  "seller-accept": "Seller has not accepted this order",
  "seller-dispatch": "Seller has not dispatched it",
  "proof-reupload": "Buyer has not re-uploaded a payment proof",
  "delivery-confirm": "Delivery has not been confirmed",
  "return-respond": "Seller has not answered a return request",
  "return-post": "Buyer has not posted the return",
  "return-receive": "A posted return has not arrived",
  "return-inspect": "Seller has not inspected a received return",
  "claim-shipping": "Transit claim window still open",
  "claim-sale": "Sale claim window still open",
  "order-complete": "Dispute window still open",
  "payout-release": "Payout quiet period still running",
};

function PageInner() {
  const [items, setItems] = useState<ObligationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [window_, setWindow] = useState<"overdue" | "upcoming">("overdue");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    fetch(`${API_ROUTES.ADMIN.MAINTENANCE_OBLIGATIONS}?window=${window_}`)
      .then(async (r) => {
        /*
         * The meta is read BEFORE `readListResponse` consumes nothing further —
         * truncation is the one fact on this page that changes its meaning, so
         * it cannot be dropped on the floor. A saturated page means the sweep is
         * behind, not that there are exactly 100 of them.
         */
        const clone = r.clone();
        const rows = await readListResponse<ObligationRow>(r, "obligations");
        const body = await clone.json().catch(() => null);
        return { rows, truncated: Boolean(body?.data?.meta?.truncated) };
      })
      .then(({ rows, truncated: t }) => {
        if (cancelled) return;
        setItems(rows);
        setTruncated(t);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(normalizeError(err).message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [window_]);

  return (
    <Section>
      <Container size="2xl">
        <Stack gap="lg" padding="y-lg">
          <Heading level={1}>Obligations</Heading>
          <Text color="muted">
            Every deadline in the order lifecycle. Read-only: this collection is
            a due-date index, and the sweep decides from the order itself. To act
            early, act on the order.
          </Text>

          <Row gap="sm">
            <Button
              variant={window_ === "overdue" ? "primary" : "outline"}
              size="sm"
              onClick={() => setWindow("overdue")}
            >
              Overdue
            </Button>
            <Button
              variant={window_ === "upcoming" ? "primary" : "outline"}
              size="sm"
              onClick={() => setWindow("upcoming")}
            >
              Due within 7 days
            </Button>
          </Row>

          {truncated ? (
            <Alert variant="warning" title="This list is cut off">
              The query hit its limit, so there are more than are shown. On the
              overdue tab that means the sweep is behind rather than that the
              list is complete.
            </Alert>
          ) : null}

          {loading ? (
            <Stack gap="sm">
              <Skeleton variant="rectangular" height="56px" />
              <Skeleton variant="rectangular" height="56px" />
              <Skeleton variant="rectangular" height="56px" />
            </Stack>
          ) : loadError ? (
            /*
             * A failed request must not render the empty state — `errorResponse()`
             * is valid JSON with a non-2xx status, so a `?? []` would turn "the
             * request failed" into "nothing is overdue", which on this page is
             * the most reassuring possible lie.
             */
            <Alert variant="error" title="Couldn't load the deadline list">
              {loadError} Refresh to retry.
            </Alert>
          ) : items.length === 0 ? (
            <EmptyState
              title={window_ === "overdue" ? "Nothing is overdue" : "Nothing due this week"}
              description={
                window_ === "overdue"
                  ? "The sweep is keeping up."
                  : "No deadline falls inside the next seven days."
              }
            />
          ) : (
            <Stack gap="sm">
              {items.map((o) => (
                <Row
                  key={o.id}
                  rounded="default"
                  padding="md"
                  border="default"
                  align="start"
                  justify="between"
                >
                  <Stack gap="xs" className="flex-1">
                    <Text weight="medium">{KIND_LABEL[o.kind] ?? o.kind}</Text>
                    <Text size="xs" color="muted">
                      Order {o.subjectId} · due {new Date(o.dueAt).toLocaleString()}
                      {o.warnedAt?.length ? ` · ${o.warnedAt.length} warning sent` : ""}
                    </Text>
                  </Stack>
                  <Text size="xs" color="muted">
                    {o.state}
                  </Text>
                </Row>
              ))}
            </Stack>
          )}
        </Stack>
      </Container>
    </Section>
  );
}

/*
 * Page-level Suspense inside the client file — the tree reaches
 * `useSearchParams()` through the appkit chrome, which throws during prerender
 * without a boundary (Root Cause #17b). A route-segment config is never the
 * answer; `audit-no-force-dynamic` blocks it (Root Cause #89).
 */
export default function ObligationsClient() {
  return (
    <Suspense>
      <PageInner />
    </Suspense>
  );
}
