import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  cancelOrderForUser,
  cancelOrderItemsForUser,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";

const cancelSchema = z.object({
  reason: z.string().min(1).max(500).default("Cancelled by user"),
  itemIds: z.array(z.string().min(1)).optional(),
});

export const POST = withProviders(
  createRouteHandler<(typeof cancelSchema)["_output"]>({
    auth: true,
    schema: cancelSchema,
    handler: async ({ user, body, params }) => {
      const orderId = (params as { id: string }).id;
      if (body!.itemIds?.length) {
        await cancelOrderItemsForUser(user!.uid, orderId, body!.itemIds, body!.reason);
        return successResponse(null, "Selected items cancelled");
      }
      await cancelOrderForUser(user!.uid, orderId, body!.reason);
      return successResponse(null, "Order cancelled");
    },
  }),
);