// NOT "use client" — typed REST wrappers for the D55 pre-order balance routes.
// Imported from "use client" components; audit-direct-fetch-ui ignores /lib/api/.
//
// 🛑 Deliberately NOT folded into `payment-client.ts`. That file is the
// DEPOSIT's — the payment taken at checkout, under a 15-minute window, with a
// fraud declaration. A pre-order's balance is a second payment months later
// with its own fields, its own window and its own review. One file per
// payment keeps a change to one from reaching the other, which is the whole
// reason `OrderDocument.balance` is separate storage rather than a reuse of
// `paymentProofUrl`.

import { API_ENDPOINTS } from "@mohasinac/appkit/client";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;
const CREDS = "include" as const;

export interface BalanceResult {
  ok: boolean;
  code?: string;
  error?: string;
}

async function post(url: string, body?: unknown): Promise<BalanceResult> {
  const res = await fetch(url, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  /*
   * `.catch(() => ({}))` on the BODY only, never on the request. A route that
   * 500s with an HTML error page still has to produce a usable `ok: false`
   * rather than throwing a JSON parse error over the real failure.
   */
  const json = (await res.json().catch(() => ({}))) as Omit<BalanceResult, "ok">;
  return { ok: res.ok, ...json };
}

/** Seller: the goods have landed — open the balance and start the buyer's window. */
export function openOrderBalance(orderId: string): Promise<BalanceResult> {
  return post(API_ENDPOINTS.SELLER.ORDER_OPEN_BALANCE(orderId));
}

/** Buyer: submit proof of paying the balance. */
export function submitBalanceProof(
  orderId: string,
  body: { proofUrl: string; transactionId: string },
): Promise<BalanceResult> {
  return post(API_ENDPOINTS.ORDERS.BALANCE_PROOF(orderId), body);
}

/** Staff: approve, or reject with a reason the buyer can act on. */
export function reviewBalanceProof(
  orderId: string,
  body: { approve: boolean; note?: string },
): Promise<BalanceResult> {
  return post(API_ENDPOINTS.ADMIN.ORDER_BALANCE_REVIEW(orderId), body);
}
