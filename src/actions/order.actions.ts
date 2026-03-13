"use server";

/**
 * Order Server Actions
 *
 * Mutations for user orders that call the repository directly.
 */

import { requireAuth } from "@/lib/firebase/auth-server";
import { orderRepository } from "@/repositories";
import { rateLimitByIdentifier, RateLimitPresets } from "@/lib/security";
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";
import { z } from "zod";
import type { OrderDocument } from "@/db/schema";

const cancelSchema = z.object({
  id: z.string().min(1),
  reason: z.string().min(1).max(500).default("Cancelled by user"),
});

const CANCELLABLE_STATUSES = ["pending", "confirmed"] as const;

/**
 * Cancel an order belonging to the authenticated user.
 * Only orders with status "pending" or "confirmed" can be cancelled.
 */
export async function cancelOrderAction(
  id: string,
  reason = "Cancelled by user",
): Promise<void> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `order:cancel:${user.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success) {
    throw new AuthorizationError("Too many requests. Please slow down.");
  }

  const parsed = cancelSchema.safeParse({ id, reason });
  if (!parsed.success) {
    throw new ValidationError("Invalid input");
  }

  const order = await orderRepository.findById(parsed.data.id);

  if (!order) {
    throw new ValidationError("Order not found");
  }

  if (order.userId !== user.uid) {
    throw new AuthorizationError("You are not authorised to cancel this order");
  }

  if (
    !CANCELLABLE_STATUSES.includes(
      order.status as (typeof CANCELLABLE_STATUSES)[number],
    )
  ) {
    throw new ValidationError(
      "Only pending or confirmed orders can be cancelled",
    );
  }

  await orderRepository.cancelOrder(parsed.data.id, parsed.data.reason);

  serverLogger.info("Order cancelled by user via server action", {
    userId: user.uid,
    orderId: parsed.data.id,
    reason: parsed.data.reason,
  });
}

// ─── Read Actions ─────────────────────────────────────────────────────────────

export async function listOrdersAction(): Promise<OrderDocument[]> {
  const user = await requireAuth();
  return orderRepository.findByUser(user.uid);
}

export async function getOrderByIdAction(
  id: string,
): Promise<OrderDocument | null> {
  const user = await requireAuth();
  const order = await orderRepository.findById(id);
  if (!order) throw new NotFoundError("Order not found");
  if (order.userId !== user.uid) throw new NotFoundError("Order not found");
  return order;
}
