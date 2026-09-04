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
import { RETURN_REASON } from "@mohasinac/appkit/server";

const refundSchema = z.object({
  amount: z.number().min(1),
  /**
   * Coded, not free text. An admin issuing a refund is recording WHY against
   * the same closed enum the buyer picks from, so the two are comparable and
   * the final-sale gate can reason about it.
   */
  reasonCode: z.enum(RETURN_REASON),
  reasonNote: z.string().max(500).optional(),
});

export const POST = withProviders(
  createRouteHandler<(typeof refundSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
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
              amount: body!.amount,
              reasonCode: body!.reasonCode,
              ...(body!.reasonNote ? { reasonNote: body!.reasonNote } : {}),
              refundedBy: user!.uid,
              confirmIrrevocable: true,
              method: "razorpay",
              razorpayPaymentId: order.paymentId!,
            }
          : {
              orderId: id,
              type: isFull ? "full" : "partial",
              amount: body!.amount,
              reasonCode: body!.reasonCode,
              ...(body!.reasonNote ? { reasonNote: body!.reasonNote } : {}),
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
