import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  cancelOrderForUser,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";

const cancelSchema = z.object({
  reason: z.string().min(1).max(500).default("Cancelled by user"),
});

export const POST = withProviders(
  createRouteHandler<(typeof cancelSchema)["_output"]>({
    auth: true,
    schema: cancelSchema,
    handler: async ({ user, body, params }) => {
      const orderId = (params as { id: string }).id;
      await cancelOrderForUser(user!.uid, orderId, body!.reason);
      return successResponse(null, "Order cancelled");
    },
  }),
);
