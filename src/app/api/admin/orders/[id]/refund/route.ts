import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  orderRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
} from "@mohasinac/appkit";
import { processRefundAction } from "@mohasinac/appkit/server";
import { ROLES_ADMIN_MOD } from "@/constants";

const refundSchema = z.object({
  amount: z.number().min(1),
  reason: z.string().min(1),
});

// rbac-scope-enforced-in-handler: admin role enforced via createApiHandler
export const POST = withProviders(
  createRouteHandler<(typeof refundSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:orders:write",
    schema: refundSchema,
    handler: async ({ body, params, user }) => {
      const id = (params as { id: string }).id;
      const order = await orderRepository.findById(id);
      if (!order) return errorResponse("Order not found", 404);

      const isFull = body!.amount >= order.totalPrice;
      const usesRazorpay = order.paymentMethod !== "cod" && !!order.paymentId;

      const result = await processRefundAction(
        usesRazorpay
          ? {
              orderId: id,
              type: isFull ? "full" : "partial",
              amountInPaise: body!.amount,
              reason: body!.reason,
              refundedBy: user!.uid,
              confirmIrrevocable: true,
              method: "razorpay",
              razorpayPaymentId: order.paymentId!,
            }
          : {
              orderId: id,
              type: isFull ? "full" : "partial",
              amountInPaise: body!.amount,
              reason: body!.reason,
              refundedBy: user!.uid,
              confirmIrrevocable: true,
              method: "manual",
            },
      );

      if (!result.ok) return errorResponse(result.error ?? "Refund failed", 400);
      return successResponse({ id, ...body }, "Order refunded");
    },
  }),
);
