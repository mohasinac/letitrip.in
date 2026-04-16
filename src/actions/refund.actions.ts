"use server";

/**
 * Refund Server Actions — thin entrypoint
 *
 * Authenticates, validates, rate-limits, then delegates to appkit
 * domain functions.  No business logic here.
 */

import { z } from "zod";
import { requireAuth, requireRole } from "@/lib/firebase/auth-server";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit/security";
import { AuthorizationError, ValidationError } from "@mohasinac/appkit/errors";
import {
  issuePartialRefund,
  previewCancellationRefund,
} from "@mohasinac/appkit/features/orders";
import type { PartialRefundResult } from "@mohasinac/appkit/features/orders";

// ─── Schemas ──────────────────────────────────────────────────────────────

const partialRefundSchema = z.object({
  orderId: z.string().min(1),
  deductFees: z.boolean().default(true),
  refundNote: z.string().max(500).optional(),
});

export type PartialRefundInput = z.infer<typeof partialRefundSchema>;
export type { PartialRefundResult };

// ─── Admin: Issue partial refund ───────────────────────────────────────────

export async function adminPartialRefundAction(
  input: PartialRefundInput,
): Promise<PartialRefundResult> {
  const user = await requireRole("admin");
  const rl = await rateLimitByIdentifier(
    `refund:admin:${user.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success) throw new AuthorizationError("Too many requests.");

  const parsed = partialRefundSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid input",
    );

  return issuePartialRefund(
    user.uid,
    parsed.data.orderId,
    parsed.data.deductFees,
    parsed.data.refundNote,
  );
}

// ─── User: Preview refund amount before confirming cancellation ────────────

export async function previewCancellationRefundAction(
  orderId: string,
): Promise<PartialRefundResult | null> {
  const user = await requireAuth();
  return previewCancellationRefund(user.uid, orderId);
}

