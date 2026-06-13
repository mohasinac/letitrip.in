/**
 * POST /api/admin/dev/emit-payment-webhook
 *
 * Track H — admin-only endpoint that fires a synthetic Razorpay webhook event
 * through the MOCK payment provider's in-process sink. Used by end-to-end
 * tests to drive a payment.captured / payment.failed / order.paid transition
 * without leaving the process.
 *
 * Refuses if the resolved payment provider is the real Razorpay one (the
 * mock-only operation has no analogue on the real provider).
 *
 * Guard:
 *   - createRouteHandler({ roles: ROLES_ADMIN_ONLY, permission: "settings:write" })
 *   - applyRateLimit(request, RateLimitPresets.API)
 */

import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  applyRateLimit,
  RateLimitPresets,
  serverLogger,
} from "@mohasinac/appkit";
import { getProviders } from "@mohasinac/appkit/contracts/registry";
import { ROLES_ADMIN_ONLY } from "@/constants";

const emitWebhookSchema = z.object({
  event: z.enum(["payment.captured", "payment.failed", "order.paid"]),
  orderId: z.string().min(1),
  paymentId: z.string().min(1),
  amount: z.number().int().min(1),
  currency: z.string().length(3).default("INR"),
});

// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const POST = withProviders(
  createRouteHandler<(typeof emitWebhookSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "settings:write",
    schema: emitWebhookSchema,
    handler: async ({ user, request, body }) => {
      const rl = await applyRateLimit(request, RateLimitPresets.API);
      if (!rl.success) return errorResponse("Too many requests", 429);

      const providers = getProviders();
      const payment = providers.payment as
        | (NonNullable<typeof providers.payment> & {
            name?: string;
            emitWebhook?: (payload: {
              event: string;
              orderId: string;
              paymentId: string;
              amount: number;
              currency: string;
            }) => Promise<void>;
          })
        | undefined;

      if (!payment || payment.name !== "razorpay-mock" || typeof payment.emitWebhook !== "function") {
        return errorResponse(
          "Mock payment provider is not active. Toggle siteSettings.featureFlags.useMockPayment in admin settings.",
          409,
          { code: "MOCK_PROVIDER_INACTIVE" },
        );
      }

      await payment.emitWebhook({
        event: body!.event,
        orderId: body!.orderId,
        paymentId: body!.paymentId,
        amount: body!.amount,
        currency: body!.currency,
      });

      serverLogger.info("Admin emitted mock payment webhook", {
        actorUid: user!.uid,
        event: body!.event,
        orderId: body!.orderId,
      });

      return successResponse({ emitted: true, event: body!.event });
    },
  }),
);
