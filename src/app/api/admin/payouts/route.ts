/**
 * Admin Payouts API
 *
 * GET /api/admin/payouts — List all payouts (filterable by status)
 */

import { NextRequest } from "next/server";
import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import { payoutRepository } from "@/repositories";
import type { PayoutStatus } from "@/db/schema";

export const GET = createApiHandler({
  auth: true,
  roles: ["admin", "moderator"],
  handler: async ({ request }: { request: NextRequest }) => {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as PayoutStatus | null;

    const payouts = status
      ? await payoutRepository.findByStatus(status)
      : await payoutRepository.findAll();

    const summary = {
      total: payouts.length,
      pending: payouts.filter((p) => p.status === "pending").length,
      processing: payouts.filter((p) => p.status === "processing").length,
      completed: payouts.filter((p) => p.status === "completed").length,
      failed: payouts.filter((p) => p.status === "failed").length,
      totalAmount: payouts.reduce((sum, p) => sum + p.amount, 0),
    };

    return successResponse({ payouts, summary });
  },
});
