import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  ApiErrors,
  cartRepository,
  createRouteHandler,
  successResponse,
  validateCouponForCart,
} from "@mohasinac/appkit";

const couponSchema = z.object({
  code: z.string().min(1, "Coupon code is required").max(50),
});

const removeCouponSchema = z.object({});

export const POST = withProviders(
  createRouteHandler<{ code: string }>({
    auth: true,
    schema: couponSchema,
    handler: async ({ user, body }) => {
      const { code } = body!;

      const cart = await cartRepository.getOrCreate(user!.uid);
      if (!cart.items.length) {
        return ApiErrors.badRequest("Your cart is empty");
      }

      const cartItems = cart.items.map((item) => ({
        productId: item.productId,
        sellerId: item.sellerId,
        price: item.lockedPrice ?? item.price,
        quantity: item.quantity,
        isPreOrder: item.isPreOrder ?? false,
        isAuction: item.isAuction ?? false,
      }));

      const result = await validateCouponForCart(user!.uid, code, cartItems);

      if (!result.valid) {
        return ApiErrors.badRequest(result.error ?? "Invalid coupon code");
      }

      // Persist applied coupon to cart document
      const couponDoc = result.coupon as { id?: string } | undefined;
      await cartRepository.setCoupon(user!.uid, {
        code,
        discountAmount: result.discountAmount,
        couponId: couponDoc?.id,
      });

      return successResponse({
        code,
        discountAmount: result.discountAmount,
        eligibleSubtotal: result.eligibleSubtotal,
        couponId: couponDoc?.id,
      });
    },
  }),
);

// DELETE /api/cart/coupon — remove applied coupon
export const DELETE = withProviders(
  createRouteHandler<Record<string, never>>({
    auth: true,
    schema: removeCouponSchema,
    handler: async ({ user }) => {
      await cartRepository.clearCoupon(user!.uid);
      return successResponse({ removed: true });
    },
  }),
);
