/**
 * Admin Payout Detail API Route
 *
 * PATCH /api/admin/payouts/[id] — Update payout status (admin)
 */

import { z } from "zod";
import { successResponse, errorResponse } from "@/lib/api-response";
import { NotFoundError } from "@/lib/errors";
import { payoutRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import type { PayoutStatus } from "@/db/schema";
import { createRouteHandler } from "@mohasinac/next";
import { applyRateLimit, RateLimitPresets } from "@/lib/security/rate-limit";

type IdParams = { id: string };

const updateSchema = z.object({
  status: z.enum(["pending", "processing", "completed", "failed"]),
  adminNote: z.string().optional(),
});

/**
 * PATCH /api/admin/payouts/[id]
 */
export const PATCH = createRouteHandler<
  (typeof updateSchema)["_output"],
  IdParams
>({
  roles: ["admin", "moderator"],
  schema: updateSchema,
  handler: async ({ request, user, body, params }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.API);
    if (!rl.success) return errorResponse("Too many requests", 429);
    const { id } = params!;
    const payout = await payoutRepository.findById(id);
    if (!payout) throw new NotFoundError(ERROR_MESSAGES.PAYOUT.NOT_FOUND);

    const { status, adminNote } = body!;
    const updated = await payoutRepository.updateStatus(
      id,
      status as PayoutStatus,
      adminNote ? { adminNote } : undefined,
    );

    serverLogger.info("Payout status updated by admin", {
      payoutId: id,
      adminUid: user!.uid,
      newStatus: status,
    });
    return successResponse(updated, SUCCESS_MESSAGES.PAYOUT.UPDATED);
  },
});
