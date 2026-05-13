/**
 * POST /api/orders/[id]/refund
 *
 * Issue a full or partial refund on an order. Only admin or the owning store's
 * seller may call this endpoint. Buyers submit a refund *request* via the UI —
 * refunds are always issued by staff/seller after review.
 *
 * Body: ProcessRefundInput (minus orderId, refundedBy — those are injected here).
 * Returns: { refundId }
 */

import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  orderRepository,
  storeRepository,
} from "@mohasinac/appkit";
import { processRefundAction } from "@mohasinac/appkit/server";

const bodySchema = z.object({
  type: z.enum(["full", "partial"]),
  amountInPaise: z.number().int().positive(),
  reason: z.string().min(3),
  itemIds: z.array(z.string()).optional(),
  confirmIrrevocable: z.literal(true),
  method: z.enum(["razorpay", "manual"]),
  razorpayPaymentId: z.string().optional(),
  manualTransactionId: z.string().optional(),
  proofDocumentUrl: z.string().optional(),
  proofDocumentMimeType: z.string().optional(),
});

export const POST = withProviders(
  createRouteHandler<(typeof bodySchema)["_output"]>({
    auth: true,
    roles: ["seller", "admin"],
    schema: bodySchema,
    handler: async ({ user, body, params }) => {
      const id = (params as { id: string }).id;
      const order = await orderRepository.findById(id);
      if (!order) return errorResponse("Order not found", 404);

      if (user!.role !== "admin") {
        const store = await storeRepository.findByOwnerId(user!.uid);
        if (!store || order.storeId !== store.id)
          return errorResponse("Order not found", 404);
      }

      const b = body!;
      // Type-safe union narrowing for the discriminated union in processRefundAction.
      const refundInput =
        b.method === "razorpay"
          ? {
              orderId: id,
              type: b.type,
              amountInPaise: b.amountInPaise,
              reason: b.reason,
              ...(b.itemIds ? { itemIds: b.itemIds } : {}),
              confirmIrrevocable: true as const,
              refundedBy: user!.uid,
              method: "razorpay" as const,
              razorpayPaymentId: b.razorpayPaymentId ?? order.paymentId ?? "",
            }
          : {
              orderId: id,
              type: b.type,
              amountInPaise: b.amountInPaise,
              reason: b.reason,
              ...(b.itemIds ? { itemIds: b.itemIds } : {}),
              confirmIrrevocable: true as const,
              refundedBy: user!.uid,
              method: "manual" as const,
              ...(b.manualTransactionId ? { manualTransactionId: b.manualTransactionId } : {}),
              ...(b.proofDocumentUrl ? { proofDocumentUrl: b.proofDocumentUrl } : {}),
              ...(b.proofDocumentMimeType ? { proofDocumentMimeType: b.proofDocumentMimeType } : {}),
            };

      const result = await processRefundAction(refundInput);
      return successResponse(result, "Refund processed");
    },
  }),
);
