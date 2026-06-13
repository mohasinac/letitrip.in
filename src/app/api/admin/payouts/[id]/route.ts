import { withProviders } from "@/providers.config";
import {
  PAYOUT_FIELDS,
  ROLES_ADMIN_MOD,
} from "@/constants";
import { z } from "zod";
import {
  adminUpdatePayout,
  payoutRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
  sieveFilter,
  SIEVE_OP,
} from "@mohasinac/appkit";

const updatePayoutSchema = z.object({
  status: z.enum(Object.values(PAYOUT_FIELDS.STATUS_VALUES) as [string, ...string[]]),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
});

// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:payouts:read",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const payouts = await payoutRepository.list({ filters: sieveFilter("id", SIEVE_OP.EQ, id), page: "1", pageSize: "1" });
      const payout = payouts.items[0];
      if (!payout) return errorResponse("Payout not found", 404);
      return successResponse(payout);
    },
  }),
);

// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const PATCH = withProviders(
  createRouteHandler<(typeof updatePayoutSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:payouts:write",
    schema: updatePayoutSchema,
    handler: async ({ body, params, user }) => {
      const id = (params as { id: string }).id;
      await adminUpdatePayout(user!.uid, id, body! as any);
      return successResponse({ id, ...body }, "Payout updated");
    },
  }),
);
