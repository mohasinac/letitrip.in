import { withFeatureGuard } from "@/lib/features";
import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  payoutRepository,
  adminUpdatePayout,
  sieveFilter,
  SIEVE_OP,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

/**
 * Admin Single Payout API
 *
 * GET   /api/admin/payouts/[id] — Fetch one payout via list() + sieve filter (leverages the same query path as the list endpoint).
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
    permission: "admin:payouts:read",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const payouts = await payoutRepository.list({
        filters: sieveFilter("id", SIEVE_OP.EQ, id),
        page: "1",
        pageSize: "1",
      });
      const payout = payouts.items[0];
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
    permission: "admin:payouts:write",
    schema: updatePayoutSchema,
    handler: async ({ user, params, body }) => {
      const id = (params as { id: string }).id;
      await adminUpdatePayout(user!.uid, id, body!);
      return successResponse({ id, ...body }, "Payout updated");
    },
  }),
);
export const PATCH = withFeatureGuard("PAYOUTS", __PATCH__g);
