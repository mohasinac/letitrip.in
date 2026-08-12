/**
 * POST /api/orders/[id]/payment-proof
 *
 * Buyer attaches a UPI/cash payment screenshot + transaction ID after placing
 * a manual-payment order. Only the order owner may call this.
 *
 * Body: { proofUrl: string; transactionId?: string; mimeType?: string }
 * Returns: { ok: true } | { ok: false; code: string }
 */

import { withProviders } from "@/providers.config";
import { successResponse, errorResponse, parseJsonBody } from "@mohasinac/appkit";
import { attachPaymentProofAction } from "@mohasinac/appkit/server";

async function _POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await parseJsonBody<{ proofUrl?: string; transactionId?: string; mimeType?: string }>(req);

  if (!body.proofUrl) {
    return errorResponse("proofUrl is required", 400, "MISSING_PROOF_URL");
  }

  const result = await attachPaymentProofAction(id, {
    proofUrl: body.proofUrl,
    transactionId: body.transactionId,
    mimeType: body.mimeType,
  });

  if (!result.ok) {
    if (result.error?.includes("PROOF_ALREADY_ATTACHED")) {
      return errorResponse("Payment proof already attached to this order", 409, "PROOF_ALREADY_ATTACHED");
    }
    if (result.error?.includes("UNAUTHORIZED") || result.error?.includes("Ownership")) {
      return errorResponse("Not authorized to attach proof for this order", 403, "FORBIDDEN");
    }
    return errorResponse(result.error ?? "Failed to attach payment proof", 400);
  }

  return successResponse({ ok: true });
}

const __POST__p = withProviders(_POST);

// rbac-scope-enforced-in-handler: attachPaymentProofAction verifies buyer owns the order
export const POST = __POST__p;
