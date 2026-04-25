import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  adminUpdateOrder,
  orderRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
} from "@mohasinac/appkit";

const updateOrderSchema = z.object({
  status: z.string().optional(),
  trackingNumber: z.string().optional(),
  shiprocketOrderId: z.string().optional(),
  shiprocketShipmentId: z.string().optional(),
  trackingUrl: z.string().optional(),
  notes: z.string().optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const order = await orderRepository.findById(id);
      if (!order) return errorResponse("Order not found", 404);
      return successResponse(order);
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<(typeof updateOrderSchema)["_output"]>({
    auth: true,
    roles: ["admin", "moderator"],
    schema: updateOrderSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      await adminUpdateOrder(id, body! as any);
      return successResponse({ id, ...body }, "Order updated");
    },
  }),
);
