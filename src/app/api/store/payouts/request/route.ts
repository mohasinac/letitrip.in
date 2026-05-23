/**
 * POST /api/store/payouts/request
 * Creates a new payout request for the authenticated seller's available earnings.
 * Validates no pending payout exists and that earnings are available.
 */

import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  requestPayout,
} from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

const requestPayoutSchema = z.object({
  paymentMethod: z.enum(["bank_transfer", "upi"]),
  notes: z.string().max(500).optional(),
});

export const POST = withProviders(createRouteHandler<{ paymentMethod: "bank_transfer" | "upi"; notes?: string }>({
  auth: true,
  roles: [...ROLES_STORE_WRITE],
  schema: requestPayoutSchema,
  handler: async ({ user, body }) => {
    const displayName = (user as { uid: string; displayName?: string | null }).displayName ?? "";
    const payout = await requestPayout(
      user!.uid,
      displayName,
      user!.email ?? "",
      {
        paymentMethod: body!.paymentMethod,
        ...(body!.notes ? { notes: body!.notes } : {}),
      },
    );

    return successResponse({ payout }, "Payout request submitted successfully.");
  },
}));
