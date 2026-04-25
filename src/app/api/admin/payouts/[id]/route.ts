import { withProviders } from "@/providers.config";
import { PAYOUT_FIELDS } from "@/constants/field-names";
import { z } from "zod";
import {
  adminUpdatePayout,
  payoutRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
} from "@mohasinac/appkit";

const updatePayoutSchema = z.object({
  status: z.enum(Object.values(PAYOUT_FIELDS.STATUS_VALUES) as [string, ...string[]]),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const payouts = await payoutRepository.list({ filters: `id==${id}`, page: "1", pageSize: "1" });
      const payout = payouts.items[0];
      if (!payout) return errorResponse("Payout not found", 404);
      return successResponse(payout);
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<(typeof updatePayoutSchema)["_output"]>({
    auth: true,
    roles: ["admin", "moderator"],
    schema: updatePayoutSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      await adminUpdatePayout(id, body! as any);
      return successResponse({ id, ...body }, "Payout updated");
    },
  }),
);
