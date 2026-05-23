import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  orderRepository,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

const refundSchema = z.object({
  amount: z.number().min(0),
  reason: z.string().min(1),
});

export const POST = withProviders(
  createRouteHandler<(typeof refundSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:orders:write",
    schema: refundSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      await orderRepository.cancelOrder(id, body!.reason, body!.amount);
      return successResponse({ id, ...body }, "Order refunded");
    },
  }),
);
