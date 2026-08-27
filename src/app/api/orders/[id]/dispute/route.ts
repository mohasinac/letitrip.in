/**
 * POST /api/orders/[id]/dispute
 *
 * Raises a dispute on an auto-approved order ("the automation might be
 * wrong"). Callable by the buyer, the seller (store owner), or admin/
 * moderator. Only valid on orders where `autoApproved === true` — a
 * manually-reviewed order goes through the existing return/refund flow.
 *
 * Body: { reason: string }
 * Returns: { ok: true } | error
 */

import { withProviders } from "@/providers.config";
import { successResponse, errorResponse, parseJsonBody } from "@mohasinac/appkit";
import { raiseOrderDisputeAction } from "@mohasinac/appkit/server";

async function _POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await parseJsonBody<{ reason?: string }>(req);

  if (!body.reason?.trim()) {
    return errorResponse("A reason is required", 400, { code: "MISSING_REASON" });
  }

  const result = await raiseOrderDisputeAction(id, body.reason);

  if (!result.ok) {
    if (result.error?.includes("Ownership")) {
      return errorResponse("Not authorized to raise a dispute on this order", 403, { code: "FORBIDDEN" });
    }
    if (result.error?.includes("NOT_FOUND") || result.error?.includes("not found")) {
      return errorResponse("Order not found", 404, { code: "NOT_FOUND" });
    }
    if (result.error?.includes("auto-approved")) {
      return errorResponse(
        "Disputes can only be raised on auto-approved orders",
        400,
        { code: "NOT_AUTO_APPROVED" },
      );
    }
    return errorResponse(result.error ?? "Failed to raise dispute", 400);
  }

  return successResponse({ ok: true });
}

const __POST__p = withProviders(_POST);

export const POST = __POST__p;
