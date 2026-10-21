"use client";

/**
 * ProtectionClaimsClient — the interactive half of /admin/protection-claims.
 *
 * Split from `page.tsx` so the route can export `metadata`: a `"use client"`
 * module cannot, and `/admin/reports` simply goes without one. Server page,
 * client child is the shape every other page here uses.
 *
 * ## Why this page matters more than its size suggests
 *
 * We charge 2% (min ₹30) shipment protection and 3% (min ₹49) sale protection,
 * the platform flags are seeded **true**, and sellers can self-enable. The
 * adjudication logic has existed, complete and correct, with **zero callers**
 * — `adjudicateClaim`, `protectionAvailability`, `RETURN_CUSTODY_STATES` and
 * the `returnInspection` fields were all written and never reached (D11). The
 * buyer-facing claim form gave them their first writer; this gives the decision
 * its first reader.
 *
 * Until both existed, a fee was being collected for a promise with no
 * mechanism behind it.
 *
 * ## 🛑 Hand-rolled, not `DataListingView`, and that is the smaller choice
 *
 * `ProtectionClaimsRepository` declares no `SIEVE_FIELDS`, and adding one to
 * feed a filter drawer would be the speculative-infra pattern — 576 registry
 * keys with no readers is the precedent this codebase has already paid for.
 * `listActive()` answers the only question an operator has, the queue is small
 * by construction, and the status filter runs over the rows in memory. The
 * shape is `/admin/reports`', which is the one admin page that does this
 * deliberately.
 *
 * ## 🛑 The control is a FINDING, never an outcome
 *
 * On sale cover a `change-of-mind` finding STILL refunds the buyer and moves
 * the cost to the platform, raising a report — because the promise sold was
 * unconditional. So the two buttons say what the admin OBSERVED, and the
 * consequence is computed by `adjudicateClaim`. A "reject claim" button would
 * make the cover conditional at the exact moment it is being tested.
 *
 * The outcome is therefore shown back after the decision rather than chosen:
 * who pays is something the admin learns, not something they pick.
 */

import { useEffect, useState, Suspense } from "react";
import {
  Alert,
  Button,
  Container,
  EmptyState,
  FilterChipGroup,
  Heading,
  Row,
  Section,
  Skeleton,
  Stack,
  Text,
  ADMIN_PROTECTION_CLAIM_STATUS_TABS,
} from "@mohasinac/appkit/client";
import { normalizeError } from "@mohasinac/appkit/client";
import { readListResponse } from "@/lib/api/read-list-response";
import { API_ROUTES } from "@/constants";

interface ClaimRow {
  id: string;
  orderId: string;
  buyerId: string;
  kind: "shipment" | "sale";
  reason: string;
  status: string;
  claimedAmount?: number;
  buyerNote?: string;
  createdAt?: string;
  adjudicatedAt?: string;
  finding?: string;
  refundId?: string;
}

const KIND_LABEL: Record<string, string> = {
  shipment: "Transit cover",
  sale: "Sale cover",
};

function PageInner() {
  const [items, setItems] = useState<ClaimRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [status, setStatus] = useState("All");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    // Cleared on every retry — a stale error would otherwise win the render
    // branch even after a successful reload.
    setLoadError(null);
    fetch(API_ROUTES.ADMIN.PROTECTION_CLAIMS)
      .then((r) => readListResponse<ClaimRow>(r, "protection claims"))
      .then(setItems)
      .catch((err) => setLoadError(normalizeError(err).message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const adjudicate = async (id: string, finding: "genuine" | "change-of-mind") => {
    setBusyId(id);
    setActionError(null);
    try {
      const res = await fetch(API_ROUTES.ADMIN.PROTECTION_CLAIM_BY_ID(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finding }),
      });
      if (!res.ok) throw new Error(`The claim was not adjudicated (${res.status})`);
      load();
    } catch (err) {
      /*
       * Surfaced, not swallowed. This decision moves money on the next step, so
       * a failure that looked like a success is the worst available outcome —
       * an admin would assume the buyer had been paid.
       */
      setActionError(normalizeError(err).message);
    } finally {
      setBusyId(null);
    }
  };

  const visible = status === "All" ? items : items.filter((c) => c.status === status);

  return (
    <Section>
      <Container size="2xl">
        <Stack gap="lg" padding="y-lg">
          <Heading level={1}>Protection claims</Heading>
          <Text color="muted">
            Buyers claiming against cover they paid for. A finding of
            &ldquo;genuine&rdquo; charges the seller; &ldquo;change of mind&rdquo;
            still refunds the buyer and the platform absorbs it, because the
            cover was sold unconditionally — it also raises a report, which is
            how repeat abuse is handled.
          </Text>

          <FilterChipGroup
            label="Status"
            tabs={ADMIN_PROTECTION_CLAIM_STATUS_TABS}
            value={status}
            onChange={setStatus}
          />

          {actionError ? (
            <Alert variant="error" title="That decision did not save">
              {actionError}
            </Alert>
          ) : null}

          {loading ? (
            <Stack gap="sm">
              <Skeleton variant="rectangular" height="72px" />
              <Skeleton variant="rectangular" height="72px" />
              <Skeleton variant="rectangular" height="72px" />
            </Stack>
          ) : loadError ? (
            /*
             * A FAILED request must not render the empty state. `errorResponse()`
             * is valid JSON with a non-2xx status, so `r.json()` resolves and a
             * `?? []` would produce an empty list — the page saying "nothing
             * here" when it means "the request failed". See readListResponse.
             */
            <Alert variant="error" title="Couldn't load the claim queue">
              {loadError} Refresh to retry.
            </Alert>
          ) : visible.length === 0 ? (
            <EmptyState
              title={status === "All" ? "No open claims" : "No claims in that state"}
              description="Nothing is waiting on a decision."
            />
          ) : (
            <Stack gap="sm">
              {visible.map((c) => (
                <Row
                  key={c.id}
                  rounded="default"
                  padding="md"
                  border="default"
                  align="start"
                  justify="between"
                >
                  <Stack gap="xs" className="flex-1">
                    <Text weight="medium">
                      {KIND_LABEL[c.kind] ?? c.kind} · {c.reason}
                    </Text>
                    <Text size="xs" color="muted">
                      Order {c.orderId} · buyer {c.buyerId}
                      {typeof c.claimedAmount === "number"
                        ? ` · ₹${c.claimedAmount.toFixed(2)} claimed`
                        : ""}
                    </Text>
                    {c.buyerNote ? (
                      <Text className="line-clamp-3" size="xs">
                        {c.buyerNote}
                      </Text>
                    ) : null}
                    <Text size="xs" color="muted">
                      {c.status}
                      {c.adjudicatedAt
                        ? ` · ${c.finding} on ${new Date(c.adjudicatedAt).toLocaleString()}`
                        : ""}
                      {c.refundId ? ` · refund ${c.refundId}` : ""}
                    </Text>
                  </Stack>

                  {/*
                    Hidden once adjudicated — the action throws on an
                    already-decided claim, and offering a control that is
                    guaranteed to fail is the dead-end shape (RC#56).
                  */}
                  {c.adjudicatedAt ? (
                    <Text size="xs" color="muted">
                      Decided
                    </Text>
                  ) : (
                    <Row gap="sm">
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={busyId === c.id}
                        isLoading={busyId === c.id}
                        onClick={() => adjudicate(c.id, "genuine")}
                      >
                        Genuine
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busyId === c.id}
                        onClick={() => adjudicate(c.id, "change-of-mind")}
                      >
                        Change of mind
                      </Button>
                    </Row>
                  )}
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
 * Page-level Suspense, inside the CLIENT file rather than the server page.
 *
 * The tree below reaches `useSearchParams()` through the appkit chrome, which
 * throws during prerender without a boundary (Root Cause #17b). A
 * route-segment config is never the answer — `audit-no-force-dynamic` blocks
 * it, and the layout's own boundary plus this one are what make the build
 * clean (Root Cause #89).
 */
export default function ProtectionClaimsClient() {
  return (
    <Suspense>
      <PageInner />
    </Suspense>
  );
}
