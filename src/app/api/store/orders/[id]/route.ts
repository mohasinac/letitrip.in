import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  orderRepository,
  productRepository,
} from "@mohasinac/appkit";

const updateOrderSchema = z.object({
  status: z.enum(["confirmed", "processing", "shipped", "delivered", "cancelled"]).optional(),
  trackingNumber: z.string().optional(),
  shippingCarrier: z.string().optional(),
  trackingUrl: z.string().url().optional(),
  cancellationReason: z.string().optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["seller", "admin"],
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      const order = await orderRepository.findById(id);
      if (!order) return errorResponse("Order not found", 404);

      // Sellers can only view orders containing their products
      if (user!.role !== "admin") {
        const sellerProducts = await productRepository.findBySeller(user!.uid);
        const sellerProductIds = new Set(sellerProducts.map((p) => p.id));
        const hasSellerProduct = order.items?.some((item: any) =>
          sellerProductIds.has(item.productId),
        );
        if (!hasSellerProduct) return errorResponse("Order not found", 404);
      }

      return successResponse(order);
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<(typeof updateOrderSchema)["_output"]>({
    auth: true,
    roles: ["seller", "admin"],
    schema: updateOrderSchema,
    handler: async ({ user, body, params }) => {
      const id = (params as { id: string }).id;
      const order = await orderRepository.findById(id);
      if (!order) return errorResponse("Order not found", 404);

      // Sellers can only update orders containing their products
      if (user!.role !== "admin") {
        const sellerProducts = await productRepository.findBySeller(user!.uid);
        const sellerProductIds = new Set(sellerProducts.map((p) => p.id));
        const hasSellerProduct = order.items?.some((item: any) =>
          sellerProductIds.has(item.productId),
        );
        if (!hasSellerProduct) return errorResponse("Order not found", 404);

        // Sellers can only move to processing/shipped
        const allowedStatuses = ["processing", "shipped"] as const;
        if (body!.status && !allowedStatuses.includes(body!.status as any)) {
          return errorResponse("Sellers can only update status to processing or shipped", 403);
        }
      }

      const { status, cancellationReason, ...trackingData } = body!;

      if (status === "cancelled") {
        await orderRepository.cancelOrder(id, cancellationReason ?? "Cancelled by seller");
      } else if (status) {
        await orderRepository.updateStatus(id, status, trackingData as any);
      } else {
        await orderRepository.updateStatus(id, order.status as any, trackingData as any);
      }

      const updated = await orderRepository.findById(id);
      return successResponse(updated, "Order updated");
    },
  }),
);
