"use client";

/*
 * WHY: `GET /api/user/payment-methods`, `POST` and `DELETE [id]` have all been
 *      live with ZERO consumers — a grep for the path returned only the route
 *      files themselves. No client wrapper, no `API_ROUTES` entry, no
 *      `ROUTES.USER.PAYMENT_METHODS`. Buyers had saved payment methods they
 *      could neither see nor remove.
 *
 * WHAT: The buyer's saved payment methods, with a per-row remove.
 *
 * ## 🛑 There is deliberately no "Set as default"
 *
 * `isDefault` is a real field, written on create. But `PUT
 * /api/user/payment-methods/[id]` refuses to touch it:
 *
 *     if (banStatus !== "unban_requested" || method.banStatus !== "banned") {
 *       return errorResponse("Invalid request", 400);
 *     }
 *
 * — that route exists ONLY to let a buyer appeal a ban. A Set-as-default
 * control here would 400 every time, which is worse than its absence: the
 * reader would conclude their account is broken rather than that the feature
 * is missing. The server change is named as a follow-up instead.
 *
 * @tag domain:account,payments
 * @tag layer:view
 * @tag access:client
 * @tag consumers:/user/payment-methods
 * @tag sideEffects:network
 */

// audit-detail-affordance-ok: the row already shows everything a buyer may
// see — the masked `displayLabel`, the type, whether it is the default, and
// when it was last used. The only other fields are `identifier`, encrypted at
// rest and stripped by the list route, and `identifierHash`, a dedup key.
// There is nothing behind this row to open.

import { useCallback, useEffect, useState } from "react";
import {
  ACTIONS,
  Badge,
  Button,
  ConfirmDeleteModal,
  Div,
  Row,
  Span,
  Stack,
  Text,
  normalizeError,
  useToast,
} from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";
import { fetchUserPaymentMethods, deleteUserPaymentMethod } from "@/lib/api/user-client";

interface MethodRow {
  id: string;
  type: string;
  displayLabel: string;
  isDefault?: boolean;
  banStatus?: string;
  lastUsedAt?: string;
}

const TYPE_LABEL: Record<string, string> = {
  upi: "UPI",
  card: "Card",
  bank_account: "Bank account",
  wallet: "Wallet",
};

export function UserPaymentMethodsView() {
  const [methods, setMethods] = useState<MethodRow[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<MethodRow | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    try {
      const res = await fetchUserPaymentMethods(API_ROUTES.USER.PAYMENT_METHODS);
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as { data?: MethodRow[] };
      setMethods(Array.isArray(json?.data) ? json.data : []);
      setFailed(false);
    } catch (err) {
      void normalizeError(err);
      // A failure must not render as "you have no saved methods" — that is a
      // claim about the account, and this one is about the request.
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = useCallback(async () => {
    if (!removeTarget) return;
    setRemovingId(removeTarget.id);
    try {
      const res = await deleteUserPaymentMethod(
        API_ROUTES.USER.PAYMENT_METHOD_BY_ID(removeTarget.id),
      );
      if (!res.ok) throw new Error(String(res.status));
      showToast("Payment method removed.", "success");
      await load();
    } catch (err) {
      const normalized = normalizeError(err);
      showToast(normalized.message || "Could not remove that payment method.", "error");
    } finally {
      setRemovingId(null);
      setRemoveTarget(null);
    }
  }, [removeTarget, load, showToast]);

  if (failed) {
    return (
      <Div surface="danger-surface" color="error" padding="inline" rounded="xl" textSize="sm">
        We could not load your saved payment methods. Refresh to try again.
      </Div>
    );
  }

  if (methods === null) {
    return <Text size="sm" color="muted">Loading your saved methods…</Text>;
  }

  if (methods.length === 0) {
    return (
      <Text size="sm" color="muted">
        You have no saved payment methods. One is saved when you choose to at checkout.
      </Text>
    );
  }

  return (
    <>
      <Stack gap="sm">
        {methods.map((m) => (
          <Row
            key={m.id}
            surface="card"
            padding="sm"
            rounded="lg"
            align="center"
            justify="between"
            gap="md"
          >
            <Stack gap="none" className="min-w-0">
              <Row gap="sm" align="center" wrap>
                {/*
                  `displayLabel` is the PRE-MASKED string the repository
                  stores for exactly this. The real identifier is encrypted at
                  rest and the list route strips it; never render `identifier`.
                */}
                <Text size="sm" weight="medium" color="primary">{m.displayLabel}</Text>
                <Span size="xs" color="muted">{TYPE_LABEL[m.type] ?? m.type}</Span>
                {m.isDefault && <Badge variant="active" size="xs">Default</Badge>}
                {m.banStatus === "banned" && <Badge variant="danger" size="xs">Blocked</Badge>}
              </Row>
              {m.lastUsedAt && (
                <Text size="xs" color="muted">
                  Last used {new Date(m.lastUsedAt).toLocaleDateString("en-IN")}
                </Text>
              )}
            </Stack>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={removingId === m.id}
              aria-label={`${ACTIONS.USER["delete-payment-method"].ariaLabel}: ${m.displayLabel}`}
              onClick={() => setRemoveTarget(m)}
            >
              {ACTIONS.USER["delete-payment-method"].label}
            </Button>
          </Row>
        ))}
      </Stack>

      {removeTarget && (
        <ConfirmDeleteModal
          isOpen
          /* Rule #7 — copy from the ActionDef. */
          title={ACTIONS.USER["delete-payment-method"].confirmation?.title}
          message={ACTIONS.USER["delete-payment-method"].confirmation?.body}
          confirmText={ACTIONS.USER["delete-payment-method"].confirmation?.confirmLabel}
          isDeleting={removingId === removeTarget.id}
          onConfirm={() => void remove()}
          onClose={() => setRemoveTarget(null)}
        />
      )}
    </>
  );
}
