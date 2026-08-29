/**
 * PATCH /api/admin/orders/[id]/payment-reupload
 *
 * Admin/moderator requests a corrected proof re-upload — the "honest
 * mistake" tier of the two-tier payment review (blurry screenshot, wrong
 * amount typed). Clears the existing proof and extends the buyer's payment
 * deadline by 15 more minutes; no penalty.
 *
 * Body: { note: string }
 * Returns: { ok: true } | error
 */

import { withProviders } from "@/providers.config";
import { z } from "zod";
import { createRouteHandler, successResponse, errorResponse } from "@mohasinac/appkit";
import { adminRequestProofReuploadAction } from "@mohasinac/appkit/server";
import { ROLES_ADMIN_MOD } from "@/constants";

const schema = z.object({
  note: z.string().min(1, "A reason is required"),
});

export const PATCH = withProviders(
  createRouteHandler<(typeof schema)["_output"]>({
    roles: ROLES_ADMIN_MOD,
    permission: "admin:orders:write",
    schema,
    handler: async ({ params, body }) => {
      const { id } = params as { id: string };

      const result = await adminRequestProofReuploadAction(id, body!.note);

      if (!result.ok) {
        if (result.error?.includes("UNAUTHORIZED") || result.error?.includes("moderator")) {
          return errorResponse("Only admin or moderator can request a re-upload", 403, { code: "FORBIDDEN" });
        }
        if (result.error?.includes("NOT_FOUND") || result.error?.includes("not found")) {
          return errorResponse("Order not found", 404, { code: "NOT_FOUND" });
        }
        return errorResponse(result.error ?? "Failed to request re-upload", 400);
      }

      return successResponse({ ok: true });
    },
  }),
);
