"use client";

/**
 * ClaimClient — file a protection claim against one order.
 *
 * ## The fee was being charged for a promise with no path
 *
 * 2% (min ₹30) shipment protection and 3% (min ₹49) sale protection, platform
 * flags seeded TRUE, sellers able to self-enable — and the entire claim
 * mechanism (`adjudicateClaim`, `protectionAvailability`,
 * `RETURN_CUSTODY_STATES`, the `returnInspection` fields) had zero callers
 * (D11). The admin adjudication page gave the decision a reader; this gives the
 * buyer the only way to start one.
 *
 * ## 🛑 Reasons, never a cover picker
 *
 * The cover kind is derived from the reason server-side. A dropdown offering
 * "transit cover / sale cover" would let a buyer file a non-delivery against
 * the 7-day sale window after the 48-hour transit window had closed — the
 * window rule defeated by a dropdown.
 *
 * And the form shows only reasons that can be filed RIGHT NOW, each verdict
 * computed server-side. The alternative — six reasons, four of which are
 * rejected after the buyer has written a description — is the dead-end shape
 * (Root Cause #56) applied to someone trying to recover money.
 *
 * ## 🛑 An unavailable reason is EXPLAINED, not hidden
 *
 * "This order does not include that cover" is a fact about the order; hiding it
 * would leave a buyer who paid for transit cover wondering why non-delivery is
 * missing from the list. Shown greyed with its reason, so the absence is
 * answered rather than noticed.
 */

import { use, useEffect, useState, Suspense } from "react";
import { Link } from "@/i18n/navigation";
import {
  Alert,
  Button,
  Container,
  Heading,
  Row,
  Section,
  Skeleton,
  Stack,
  Text,
  Textarea,
  ROUTES,
  PROTECTION_CLAIM_REASON_LABEL,
} from "@mohasinac/appkit/client";
import { normalizeError } from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";

interface ReasonVerdict {
  reason: string;
  can: boolean;
  why?: string;
  message?: string;
}

function ClaimInner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [verdicts, setVerdicts] = useState<ReasonVerdict[]>([]);
  const [detailMin, setDetailMin] = useState(20);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [detail, setDetail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filedId, setFiledId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setLoadError(null);
    fetch(API_ROUTES.USER.ORDER_CLAIM(id))
      .then(async (r) => {
        const body = await r.json().catch(() => null);
        /*
         * Status before body. `errorResponse()` is valid JSON, so trusting the
         * body first would turn "the request failed" into "no reason is
         * claimable" — which on this page reads as a refusal of a claim nobody
         * ever assessed.
         */
        if (!r.ok) throw new Error(body?.error ?? `Could not load this order (${r.status})`);
        return body?.data as { reasons: ReasonVerdict[]; detailMin: number };
      })
      .then((d) => {
        setVerdicts(d?.reasons ?? []);
        if (typeof d?.detailMin === "number") setDetailMin(d.detailMin);
      })
      .catch((err) => setLoadError(normalizeError(err).message))
      .finally(() => setLoading(false));
  }, [id]);

  const submit = async () => {
    if (!reason) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(API_ROUTES.USER.ORDER_CLAIM(id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, detail }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error ?? `The claim was not filed (${res.status})`);
      setFiledId(body?.data?.claimId ?? "filed");
    } catch (err) {
      setError(normalizeError(err).message);
    } finally {
      setBusy(false);
    }
  };

  const available = verdicts.filter((v) => v.can);
  const blocked = verdicts.filter((v) => !v.can);

  if (filedId) {
    return (
      <Section>
        <Container size="md">
          <Stack gap="md" padding="y-lg">
            <Heading level={1}>Claim filed</Heading>
            <Text color="muted">
              We have your claim and our team will assess it. You will hear from
              us about what happens next.
            </Text>
            {/*
              🛑 No timeline promised. The published refund timelines already
              contradict each other in three places and reconciling them is its
              own piece of work — adding a fourth number here would be a new
              owner of a figure that needs fewer, not more.
            */}
            <Row gap="sm">
              <Button variant="outline" asChild>
                <Link href={String(ROUTES.USER.ORDER_DETAIL(id))}>Back to the order</Link>
              </Button>
            </Row>
          </Stack>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" padding="y-lg">
          <Stack gap="xs">
            <Heading level={1}>Claim on protection cover</Heading>
            <Text color="muted">
              Tell us what went wrong. We assess the claim and decide who bears
              it — you do not need to work that out.
            </Text>
          </Stack>

          {error ? (
            <Alert variant="error" title="The claim was not filed">
              {error}
            </Alert>
          ) : null}

          {loading ? (
            <Stack gap="sm">
              <Skeleton variant="rectangular" height="48px" />
              <Skeleton variant="rectangular" height="48px" />
              <Skeleton variant="rectangular" height="96px" />
            </Stack>
          ) : loadError ? (
            <Alert variant="error" title="Couldn't load this order">
              {loadError} Refresh to retry.
            </Alert>
          ) : available.length === 0 ? (
            <Stack gap="md">
              <Alert variant="info" title="No claim can be filed on this order">
                {blocked.length > 0
                  ? "Here is why each kind of claim is unavailable."
                  : "This order has no protection cover on it."}
              </Alert>
              {blocked.length > 0 ? (
                <Stack gap="xs">
                  {blocked.map((v) => (
                    <Text key={v.reason} size="xs" color="muted">
                      <strong>
                        {PROTECTION_CLAIM_REASON_LABEL[
                          v.reason as keyof typeof PROTECTION_CLAIM_REASON_LABEL
                        ] ?? v.reason}
                      </strong>{" "}
                      — {v.message}
                    </Text>
                  ))}
                </Stack>
              ) : null}
              <Row gap="sm">
                <Button variant="outline" asChild>
                  <Link href={String(ROUTES.USER.ORDER_DETAIL(id))}>Back to the order</Link>
                </Button>
              </Row>
            </Stack>
          ) : (
            <Stack gap="md">
              <Stack gap="sm" role="radiogroup" aria-label="What went wrong">
                <Text size="sm" weight="semibold">
                  What went wrong?
                </Text>
                {available.map((v) => (
                  <Button
                    key={v.reason}
                    variant={reason === v.reason ? "primary" : "outline"}
                    size="sm"
                    role="radio"
                    aria-checked={reason === v.reason}
                    onClick={() => setReason(v.reason)}
                  >
                    {PROTECTION_CLAIM_REASON_LABEL[
                      v.reason as keyof typeof PROTECTION_CLAIM_REASON_LABEL
                    ] ?? v.reason}
                  </Button>
                ))}
              </Stack>

              {/*
                Blocked reasons are shown, not hidden — a buyer who paid for
                transit cover must not be left wondering why "it never arrived"
                is missing from the list.
              */}
              {blocked.length > 0 ? (
                <Stack gap="xs">
                  <Text size="xs" color="muted">
                    Not available on this order:
                  </Text>
                  {blocked.map((v) => (
                    <Text key={v.reason} size="xs" color="muted">
                      {PROTECTION_CLAIM_REASON_LABEL[
                        v.reason as keyof typeof PROTECTION_CLAIM_REASON_LABEL
                      ] ?? v.reason}{" "}
                      — {v.message}
                    </Text>
                  ))}
                </Stack>
              ) : null}

              <Stack gap="xs">
                <Textarea
                  label="What happened?"
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  rows={5}
                  placeholder="When you expected it, what you found when it arrived, anything the courier or seller told you."
                />
                <Text size="xs" color="muted">
                  At least {detailMin} characters — a claim with no account of
                  the problem cannot be assessed.
                </Text>
              </Stack>

              <Row gap="sm">
                <Button
                  variant="primary"
                  isLoading={busy}
                  disabled={busy || !reason || detail.trim().length < detailMin}
                  onClick={submit}
                >
                  File the claim
                </Button>
                <Button variant="ghost" asChild>
                  <Link href={String(ROUTES.USER.ORDER_DETAIL(id))}>Cancel</Link>
                </Button>
              </Row>
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
export default function ClaimClient(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <ClaimInner {...props} />
    </Suspense>
  );
}
