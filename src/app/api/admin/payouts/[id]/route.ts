import { withFeatureGuard } from "@/lib/features";
import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  payoutRepository,
  adminUpdatePayout,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

/**
 * Admin Single Payout API
 *
 * GET   /api/admin/payouts/[id] — Fetch one payout by ID.
 * PATCH /api/admin/payouts/[id] — Update payout status (pending/processing/paid/failed) + transaction reference via adminUpdatePayout.
 *
 * Status literals here match `payoutRepository`'s actual stored values
 * ("paid", not "completed") — the local `PAYOUT_FIELDS.STATUS_VALUES`
 * constant in `@/constants` disagrees with the repository and is not used.
 */

const updatePayoutSchema = z.object({
  status: z.enum(["pending", "processing", "paid", "failed"]),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
});

const __GET__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const payout = await payoutRepository.findById(id);
      if (!payout) return errorResponse("Payout not found", 404);
      return successResponse(payout);
    },
  }),
);
export const GET = withFeatureGuard("PAYOUTS", __GET__g);

const __PATCH__g = withProviders(
  createRouteHandler<(typeof updatePayoutSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    schema: updatePayoutSchema,
    handler: async ({ user, params, body }) => {
      const id = (params as { id: string }).id;
      await adminUpdatePayout(user!.uid, id, body!);
      return successResponse({ id, ...body }, "Payout updated");
    },
  }),
);
export const PATCH = withFeatureGuard("PAYOUTS", __PATCH__g);
