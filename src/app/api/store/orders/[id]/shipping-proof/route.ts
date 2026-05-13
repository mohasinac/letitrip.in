/**
 * POST /api/store/orders/[id]/shipping-proof
 *
 * Seller records a shipping-proof media URL on the order after uploading
 * the proof via the signed-URL flow (/api/media). Accepts the already-
 * uploaded URL + MIME type; never accepts raw bytes.
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

const bodySchema = z.object({
  /** Media slug URL returned by the signed-URL upload flow. */
  shippingProofUrl: z.string().min(1),
  shippingProofMimeType: z.string().min(1),
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

      await orderRepository.update(id, {
        shippingProofUrl: body!.shippingProofUrl,
        shippingProofMimeType: body!.shippingProofMimeType,
        shippingProofUploadedAt: new Date(),
        shippingProofUploadedBy: user!.uid,
      });

      const updated = await orderRepository.findById(id);
      return successResponse(updated, "Shipping proof recorded");
    },
  }),
);
