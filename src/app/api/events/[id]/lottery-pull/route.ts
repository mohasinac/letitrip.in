import { withProviders } from "@/providers.config";
import { z } from "zod";
import { errorResponse, successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { applyRateLimit, RateLimitPresets, submitLotteryPullAction } from "@mohasinac/appkit/server";

/*
 * A lottery pull is a PAYMENT CLAIM, and it was the least validated body in
 * the app: `parseJsonBody(request) as Record<string, unknown>` handed four
 * `unknown`s straight to `submitLotteryPullAction`, which assigns a slot.
 *
 * `purchasedItemNumber` is the one that matters most — it selects which slot
 * the caller is claiming. As `unknown` it could be a string, a float, or an
 * object, and nothing between the request and the slot write proved otherwise.
 * `.int().positive()` is the actual domain: slots are numbered from 1.
 *
 * `transactionId` is the seller's reconciliation key against a real UPI/bank
 * transfer, so it is required and bounded rather than optional-and-anything.
 */
const lotteryPullSchema = z.object({
  userPhone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{6,20}$/, "Enter a valid contact number"),
  transactionId: z.string().trim().min(1, "transactionId is required").max(120),
  paymentTime: z.string().trim().min(1, "paymentTime is required").max(60),
  purchasedItemNumber: z.number().int().positive("purchasedItemNumber must be a slot number"),
});


const __POST__g = withProviders(
  createRouteHandler<(typeof lotteryPullSchema)["_output"]>({
    auth: true,
    schema: lotteryPullSchema,
    handler: async ({ user, request, body, params }) => {
      const rl = await applyRateLimit(request, RateLimitPresets.STRICT);
      if (!rl.success) return errorResponse("Too many requests", 429);

      const id = (params as { id: string }).id;

      const result = await submitLotteryPullAction({
        sourceType: "event",
        eventId: id,
        userId: user!.uid,
        ...body!,
      });

      if (!result.ok) return errorResponse(result.error ?? "Lottery pull failed", 400);
      return successResponse(result.data, "Slot assigned");
    },
  }),
);

export const POST = __POST__g;
