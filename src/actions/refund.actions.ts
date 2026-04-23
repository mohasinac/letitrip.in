"use server";

/**
 * Refund Server Actions â€” thin entrypoint
 *
 * Authenticates, validates, rate-limits, then delegates to appkit
 * domain functions.  No business logic here.
 */

import { z } from "zod";
import { requireAuthUser, requireRoleUser } from "@mohasinac/appkit";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit";
import { AuthorizationError, ValidationError } from "@mohasinac/appkit";
import {
  issuePartialRefund,
  previewCancellationRefund,
  type PartialRefundResult,
} from "@mohasinac/appkit";

// --- Schemas --------------------------------------------------------------

const partialRefundSchema = z.object({
  orderId: z.string().min(1),
  deductFees: z.boolean().default(true),
  refundNote: z.string().max(500).optional(),
});

export type PartialRefundInput = z.infer<typeof partialRefundSchema>;

// --- Admin: Issue partial refund -------------------------------------------

export async function adminPartialRefundAction(
  input: PartialRefundInput,
): Promise<PartialRefundResult> {
  const user = await requireRoleUser("admin");
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

// --- User: Preview refund amount before confirming cancellation ------------

export async function previewCancellationRefundAction(
  orderId: string,
): Promise<PartialRefundResult | null> {
  const user = await requireAuthUser();
  return previewCancellationRefund(user.uid, orderId);
}

