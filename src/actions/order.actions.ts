"use server";

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
  listOrdersForUser,
  getOrderByIdForUser,
} from "@mohasinac/appkit";
import { z } from "zod";
import type { OrderDocument } from "@mohasinac/appkit";

const cancelSchema = z.object({
  id: z.string().min(1),
  reason: z.string().min(1).max(500).default("Cancelled by user"),
});

export async function cancelOrderAction(
  id: string,
  reason = "Cancelled by user",
): Promise<void> {
  const user = await requireAuthUser();
  const rl = await rateLimitByIdentifier(
    `order:cancel:${user.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = cancelSchema.safeParse({ id, reason });
  if (!parsed.success) throw new ValidationError("Invalid input");

  return cancelOrderForUser(user.uid, parsed.data.id, parsed.data.reason);
}

// --- Read Actions -------------------------------------------------------------

export async function listOrdersAction(): Promise<OrderDocument[]> {
  const user = await requireAuthUser();
  return listOrdersForUser(user.uid) as Promise<OrderDocument[]>;
}

export async function getOrderByIdAction(
  id: string,
): Promise<OrderDocument | null> {
  const user = await requireAuthUser();
  return getOrderByIdForUser(user.uid, id) as Promise<OrderDocument>;
}

