/**
 * POST /api/orders/[id]/dispute
 *
 * Raises a dispute on an order. Callable by the buyer, the seller (store
 * owner), or admin/moderator.
 *
 * 🛑 This used to be narrow: "only valid on orders where
 * `autoApproved === true` — a manually-reviewed order goes through the
 * existing return/refund flow". That restriction is GONE. Disputes are now
 * general and gated by `kind` instead:
 *
 *   item        — only once the order was received
 *   not_reached — only once the ETD is 3+ days past, and only if undelivered
 *
 * Body: { kind, reasonId, detail? }
 * Returns: { ok: true } | error
 */

import { withProviders } from "@/providers.config";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { parseJsonBody } from "@mohasinac/appkit/next/api/parseJsonBody";
import { raiseOrderDisputeAction } from "@mohasinac/appkit/server";

async function _POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await parseJsonBody<{ kind?: string; reasonId?: string; detail?: string }>(req);

  /*
   * Shape only. The action owns every real decision — that the kind is a
   * member of the union, that the reason exists and belongs to that kind, and
   * that the gate passes. Re-implementing any of those here is how two copies
   * of one rule come to disagree.
   */
  if (!body.kind?.trim()) {
    return errorResponse("Pick what kind of problem this is", 400, { code: "MISSING_KIND" });
  }
  if (!body.reasonId?.trim()) {
    return errorResponse("A reason is required", 400, { code: "MISSING_REASON" });
  }

  const result = await raiseOrderDisputeAction(id, {
    /*
     * Cast at the boundary because a request body is `string`, and
     * `isDisputeKind` inside the action is what actually narrows it. The cast
     * buys entry to a validated function, not a skipped check — a 400 comes
     * straight back if it is not a real kind.
     */
    kind: body.kind.trim() as Parameters<typeof raiseOrderDisputeAction>[1]["kind"],
    reasonId: body.reasonId.trim(),
    detail: body.detail?.trim() || undefined,
  });

  if (!result.ok) {
    if (result.error?.includes("Ownership")) {
      return errorResponse("Not authorized to raise a dispute on this order", 403, { code: "FORBIDDEN" });
    }
    if (result.error?.includes("NOT_FOUND") || result.error?.includes("not found")) {
      return errorResponse("Order not found", 404, { code: "NOT_FOUND" });
    }
    /*
     * The NOT_AUTO_APPROVED branch is gone with the restriction it translated.
     * A gate refusal is a 400 carrying the action's own buyer-facing message,
     * which already names the next step ("…you can raise a delivery issue
     * from 14 Nov") — re-mapping it to a generic code here would throw away
     * the only useful part.
     */
    return errorResponse(result.error ?? "Failed to raise dispute", 400);
  }

  return successResponse({ ok: true });
}

const __POST__p = withProviders(_POST);

export const POST = __POST__p;
