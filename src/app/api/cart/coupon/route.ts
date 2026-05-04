import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  ApiErrors,
  cartRepository,
  createRouteHandler,
  successResponse,
  validateCouponForCart,
} from "@mohasinac/appkit";
import type { CartAppliedCoupon } from "@mohasinac/appkit";

const couponSchema = z.object({
  code: z.string().min(1, "Coupon code is required").max(50),
});

const removeCouponSchema = z.object({
  code: z.string().min(1).max(50).optional(),
});

// ---------------------------------------------------------------------------
// Conflict rules
//   1. Same code already applied → duplicate.
//   2. Seller-scoped: only one coupon per seller (they don't stack).
//   3. Admin coupon with combineWithSellerCoupons=false → cannot coexist
//      with any seller coupon already in the cart (and vice-versa).
// ---------------------------------------------------------------------------
function detectConflict(
  existing: CartAppliedCoupon[],
  incoming: {
    code: string;
    scope: "admin" | "seller";
    sellerId?: string;
    combineWithSellerCoupons?: boolean;
  },
): string | null {
  for (const applied of existing) {
    // Rule 1 — duplicate (already checked before this, but guard anyway)
    if (applied.code === incoming.code) {
      return `Coupon ${incoming.code} is already applied.`;
    }

    // Rule 2 — two seller coupons for the same store don't stack
    if (
      incoming.scope === "seller" &&
      applied.scope === "seller" &&
      applied.sellerId === incoming.sellerId
    ) {
      return `A coupon for this store is already applied (${applied.code}). Remove it first.`;
    }

    // Rule 3a — incoming admin coupon that forbids seller coupons, but one is present
    if (
      incoming.scope === "admin" &&
      incoming.combineWithSellerCoupons === false &&
      applied.scope === "seller"
    ) {
      return `${incoming.code} cannot be combined with the seller coupon ${applied.code}. Remove it first.`;
    }

    // Rule 3b — incoming seller coupon, but there's an admin coupon that forbids mixing
    if (
      incoming.scope === "seller" &&
      applied.scope === "admin" &&
      applied.combineWithSellerCoupons === false
    ) {
      return `The admin coupon ${applied.code} does not allow additional seller coupons. Remove it first.`;
    }
  }
  return null;
}

export const POST = withProviders(
  createRouteHandler<{ code: string }>({
    auth: true,
    schema: couponSchema,
    handler: async ({ user, body }) => {
      const { code } = body!;
      const normalised = code.toUpperCase();

      const cart = await cartRepository.getOrCreate(user!.uid);
      if (!cart.items.length) {
        return ApiErrors.badRequest("Your cart is empty");
      }

      const existingCoupons = cart.appliedCoupons ?? [];

      // Fast duplicate check before hitting Firestore
      if (existingCoupons.some((c) => c.code === normalised)) {
        return ApiErrors.badRequest("This coupon is already applied");
      }

      const cartItems = cart.items.map((item) => ({
        productId: item.productId,
        sellerId: item.sellerId,
        price: item.lockedPrice ?? item.price,
        quantity: item.quantity,
        isPreOrder: item.isPreOrder ?? false,
        isAuction: item.isAuction ?? false,
      }));

      const result = await validateCouponForCart(user!.uid, normalised, cartItems);

      if (!result.valid) {
        return ApiErrors.badRequest(result.error ?? "Invalid coupon code");
      }

      const couponDoc = result.coupon as
        | {
            id?: string;
            scope?: string;
            sellerId?: string;
            restrictions?: { combineWithSellerCoupons?: boolean };
          }
        | undefined;

      const incomingScope = (couponDoc?.scope ?? "admin") as "admin" | "seller";
      const combineFlag = couponDoc?.restrictions?.combineWithSellerCoupons;

      // Conflict detection against all currently applied coupons
      const conflict = detectConflict(existingCoupons, {
        code: normalised,
        scope: incomingScope,
        sellerId: couponDoc?.sellerId,
        combineWithSellerCoupons: combineFlag,
      });
      if (conflict) {
        return ApiErrors.badRequest(conflict);
      }

      // Map eligible product IDs → itemIds stored on the coupon for checkout use
      const applicableItemIds = result.eligibleProductIds
        ? cart.items
            .filter((item) => result.eligibleProductIds!.includes(item.productId))
            .map((item) => item.itemId)
        : undefined;

      await cartRepository.addCoupon(user!.uid, {
        code: normalised,
        discountAmount: result.discountAmount ?? 0,
        couponId: couponDoc?.id,
        scope: incomingScope,
        sellerId: couponDoc?.sellerId,
        applicableItemIds,
        // Store the combine flag so conflict detection works for future coupons
        combineWithSellerCoupons: combineFlag,
      });

      return successResponse({
        code: normalised,
        discountAmount: result.discountAmount,
        eligibleSubtotal: result.eligibleSubtotal,
        couponId: couponDoc?.id,
        scope: incomingScope,
        sellerId: couponDoc?.sellerId,
        applicableItemIds,
      });
    },
  }),
);

// DELETE /api/cart/coupon — remove one coupon by code, or all if no code given
export const DELETE = withProviders(
  createRouteHandler<{ code?: string }>({
    auth: true,
    schema: removeCouponSchema,
    handler: async ({ user, body }) => {
      const code = body?.code?.toUpperCase();
      if (code) {
        await cartRepository.removeCoupon(user!.uid, code);
      } else {
        await cartRepository.clearAllCoupons(user!.uid);
      }
      return successResponse({ removed: true, code: code ?? null });
    },
  }),
);
