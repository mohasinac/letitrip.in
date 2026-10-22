"use server";

import { wrapAction, type ActionResult } from "@mohasinac/appkit/server";
/**
 * Order Server Actions — thin entrypoint
 *
 * Authenticates, validates, rate-limits, then delegates to appkit
 * domain functions.  No business logic here.
 */

import { requireAuthUser } from "@mohasinac/appkit/providers/auth-firebase/helpers";
import { rateLimitByIdentifier, RateLimitPresets } from "@mohasinac/appkit/security/rate-limit";
import { AuthorizationError } from "@mohasinac/appkit/errors/authorization-error";
import { ValidationError } from "@mohasinac/appkit/errors/validation-error";
import { cancelOrderForUser, cancelOrderItemsForUser, listOrdersForUser, getOrderByIdForUser } from "@mohasinac/appkit/features/orders/actions/order-actions";
import { requestReturnAction as appkitRequestReturnAction } from "@mohasinac/appkit/server";
import { z } from "zod";
import type { OrderDocument, OrderPlain } from "@mohasinac/appkit/features/orders/schemas/firestore";
import type { CancellationRefundOutcome } from "@mohasinac/appkit/features/orders/types/index";

const cancelSchema = z.object({
  id: z.string().min(1),
  reason: z.string().min(1).max(500).default("Cancelled by user"),
  itemIds: z.array(z.string().min(1)).optional(),
});

/**
 * Cancel an order, or some of its items.
 *
 * 🛑 Returns the refund outcome now, where it returned `void` (D14). The old
 * signature could only say "it worked", which on a *paid* order was the problem:
 * stock was restored and the money was kept, and `void` is exactly the shape
 * that cannot report it.
 *
 * `null` means a genuinely-partial item cancellation — no order-level refund
 * decision was taken, and the per-item add-on arithmetic is D15/D16, still
 * unbuilt. Returning a zero outcome there would claim otherwise.
 */
export async function cancelOrderAction(
  id: string,
  reason = "Cancelled by user",
  itemIds?: string[],
): Promise<ActionResult<CancellationRefundOutcome | null>> {
  return wrapAction(async () => {
  const user = await requireAuthUser();
  const rl = await rateLimitByIdentifier(
    `order:cancel:${user.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = cancelSchema.safeParse({ id, reason, itemIds });
  if (!parsed.success) throw new ValidationError("Invalid input");

  if (parsed.data.itemIds?.length) {
    return cancelOrderItemsForUser(
      user.uid,
      parsed.data.id,
      parsed.data.itemIds,
      parsed.data.reason,
    );
  }

  return cancelOrderForUser(user.uid, parsed.data.id, parsed.data.reason);
  });
}

/**
 * Buyer requests a return on a delivered order.
 *
 * Thin entrypoint, matching `cancelOrderAction` above: authenticate,
 * rate-limit, delegate. The return window, the ownership check and the
 * final-sale gate all live in `requestReturnAction` — server-side, where a
 * client cannot skip them.
 *
 * STRICT rate limit, same as cancellation: both are irreversible-ish state
 * changes on someone else's money.
 */
export async function requestReturnAction(
  id: string,
  reasonCode: string,
  reasonNote?: string,
  itemIds?: string[],
): Promise<ActionResult<unknown>> {
  const user = await requireAuthUser();
  const rl = await rateLimitByIdentifier(
    `order:return:${user.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  return appkitRequestReturnAction({
    orderId: id,
    reasonCode,
    ...(reasonNote ? { reasonNote } : {}),
    ...(itemIds?.length ? { itemIds } : {}),
  });
}

// --- Read Actions -------------------------------------------------------------

export async function listOrdersAction(): Promise<ActionResult<OrderDocument[]>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();
      return listOrdersForUser(user.uid) as Promise<OrderDocument[]>;
  });
}

/*
 * 🛑 `OrderPlain`, and the CAST IS GONE.
 *
 * `getOrderByIdForUser` now reveals and says so in its return type. The
 * `as Promise<OrderDocument>` here was the thing hiding the defect: it
 * asserted a type the value did not have, so nothing in review or in `tsc`
 * could show that the buyer's own name, email and shipping address were
 * reaching this client as `enc:v1:` ciphertext.
 *
 * A cast at a PII boundary is where this whole class of bug lives (Root
 * Cause #70 and #98) — it has no runtime effect and silences the one signal
 * available. Removing it is most of the fix.
 */
export async function getOrderByIdAction(
  id: string,
): Promise<ActionResult<OrderPlain | null>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();
    return getOrderByIdForUser(user.uid, id);
  });
}

