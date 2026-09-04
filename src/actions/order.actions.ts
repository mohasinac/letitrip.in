"use server";

import { wrapAction, type ActionResult } from "@mohasinac/appkit/server";
/**
 * Order Server Actions — thin entrypoint
 *
 * Authenticates, validates, rate-limits, then delegates to appkit
 * domain functions.  No business logic here.
 */

import { requireAuthUser } from "@mohasinac/appkit";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit";
import { AuthorizationError, ValidationError } from "@mohasinac/appkit";
import {
  cancelOrderForUser,
  cancelOrderItemsForUser,
  listOrdersForUser,
  getOrderByIdForUser,
} from "@mohasinac/appkit";
import { requestReturnAction as appkitRequestReturnAction } from "@mohasinac/appkit/server";
import { z } from "zod";
import type { OrderDocument } from "@mohasinac/appkit";

const cancelSchema = z.object({
  id: z.string().min(1),
  reason: z.string().min(1).max(500).default("Cancelled by user"),
  itemIds: z.array(z.string().min(1)).optional(),
});

export async function cancelOrderAction(
  id: string,
  reason = "Cancelled by user",
  itemIds?: string[],
): Promise<void> {
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

export async function getOrderByIdAction(
  id: string,
): Promise<ActionResult<OrderDocument | null>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();
      return getOrderByIdForUser(user.uid, id) as Promise<OrderDocument>;
  });
}

