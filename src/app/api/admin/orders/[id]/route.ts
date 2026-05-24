import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  adminUpdateOrder,
  orderRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

// ST-3 — items array shape mirrors OrderDocumentItem; PATCHing items
// replaces the array wholesale and recalculates totalAmount (sum of
// items[].totalPrice in paise).
const orderItemSchema = z.object({
  productId: z.string().min(1),
  productTitle: z.string().min(1),
  quantity: z.number().int().nonnegative(),
  unitPrice: z.number().nonnegative(),
  totalPrice: z.number().nonnegative(),
  listingType: z
    .enum([
      "standard",
      "auction",
      "pre-order",
      "prize-draw",
      "classified",
      "digital-code",
      "live",
    ])
    .optional(),
});

const updateOrderSchema = z.object({
  status: z.string().optional(),
  trackingNumber: z.string().optional(),
  shiprocketOrderId: z.string().optional(),
  shiprocketShipmentId: z.string().optional(),
  trackingUrl: z.string().optional(),
  notes: z.string().optional(),
  // ST-3 — admin can replace the order's line-item array (e.g. partial
  // fulfillment, wrong item shipped, bundle correction).
  items: z.array(orderItemSchema).optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:orders:read",
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
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:orders:write",
    schema: updateOrderSchema,
    handler: async ({ body, params, user }) => {
      const id = (params as { id: string }).id;
      const update: Record<string, unknown> = { ...body };
      // ST-3 — recalculate totalPrice when items[] is replaced so the
      // header total stays in sync with the line-item sum.
      if (body!.items && Array.isArray(body!.items)) {
        const sum = body!.items.reduce(
          (acc, it) => acc + (Number(it.totalPrice) || 0),
          0,
        );
        update.totalPrice = sum;
      }
      await adminUpdateOrder(user!.uid, id, update as any);
      return successResponse({ id, ...update }, "Order updated");
    },
  }),
);
