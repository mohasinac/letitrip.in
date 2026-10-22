"use client";

import { useEffect, useState } from "react";
import { Div, Row, Span, Stack, Text, TextLink, ROUTES, normalizeError } from "@mohasinac/appkit/client";
import {
  fetchUserPoints,
  type PointsLedgerEntry,
  type UserPointsResponse,
} from "@/lib/api/points-client";

/*
 * The ledger row type lives on the API wrapper now -- it was declared here
 * AND there, which is one shape with two owners (Root Cause #42).
 */

/**
 * Balance + ledger for the signed-in buyer.
 *
 * 🛑 Three states, not two. `null` balance means "not loaded yet" and renders
 * a placeholder; `0` is a real answer and renders as a zero. Collapsing them
 * would show every buyer a confident "0 points" for the duration of the fetch,
 * which is the same mistake `useCanSeePrices` exists to avoid one surface over
 * — and on a balance, a wrong zero is the one number people act on.
 */
export function UserPointsView() {
  const [balance, setBalance] = useState<number | null>(null);
  const [entries, setEntries] = useState<PointsLedgerEntry[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetchUserPoints();
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as UserPointsResponse;
        if (cancelled) return;
        setBalance(typeof json?.data?.balance === "number" ? json.data.balance : 0);
        setEntries(json?.data?.entries ?? []);
      } catch (err) {
        void normalizeError(err);
        if (cancelled) return;
        /*
         * An error is NOT rendered as a zero balance. "You have 0 points" is a
         * claim; "we could not load this" is the truth, and the two must not
         * look alike when the subject is money owed to the reader.
         */
        setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) {
    return (
      <Text color="muted">
        We could not load your points just now. Refresh to try again — nothing
        has been lost.
      </Text>
    );
  }

  return (
    <Stack gap="lg" className="min-w-0">
      <Div border="default" rounded="lg" padding="card" surface="card">
        <Stack gap="xs">
          <Text size="sm" color="muted">Balance</Text>
          <Text size="2xl" weight="semibold">
            {balance === null ? "—" : `${balance} point${balance === 1 ? "" : "s"}`}
          </Text>
          {balance !== null && balance > 0 && (
            <Text size="sm" color="muted">
              Worth ₹{balance} off a future order. Up to half of an order&apos;s
              total can be paid with points.
            </Text>
          )}
        </Stack>
      </Div>

      <Stack gap="sm" className="min-w-0">
        <Text weight="semibold">Activity</Text>
        {balance !== null && entries.length === 0 && (
          <Text size="sm" color="muted">
            Nothing yet. Points appear here once an order ships for less than
            the shipping you were quoted.
          </Text>
        )}
        {entries.map((e) => (
          <Div key={e.id} border="subtle" rounded="lg" padding="card-tight" className="min-w-0">
            <Row gap="sm" align="center" justify="between" className="min-w-0">
              <Stack gap="xs" className="min-w-0">
                <Text size="sm">{e.description}</Text>
                {e.orderId && (
                  <TextLink href={String(ROUTES.USER.ORDER_DETAIL(e.orderId))} size="xs">
                    {e.orderId}
                  </TextLink>
                )}
              </Stack>
              {/*
                Sign carries the meaning, so it is rendered explicitly rather
                than inferred from colour alone — a credit and a spend must be
                tellable apart without seeing colour.
              */}
              <Span weight="semibold" color={e.amount > 0 ? "success" : "muted"}>
                {e.amount > 0 ? `+${e.amount}` : e.amount}
              </Span>
            </Row>
          </Div>
        ))}
      </Stack>
    </Stack>
  );
}
