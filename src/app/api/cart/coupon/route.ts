import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  ApiErrors,
  cartRepository,
  claimedCouponsRepository,
  createRouteHandler,
  successResponse,
  validateCouponForCart,
} from "@mohasinac/appkit";
import type { CouponDocument } from "@mohasinac/appkit";
import { detectConflict } from "@/lib/coupon-conflict";

const couponSchema = z.object({
  code: z.string().min(1, "Coupon code is required").max(50),
});

const removeCouponSchema = z.object({
  code: z.string().min(1).max(50).optional(),
});

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
        storeId: item.storeId,
        price: item.lockedPrice ?? item.price,
        quantity: item.quantity,
        listingType: item.listingType,
      }));

      const result = await validateCouponForCart(user!.uid, normalised, cartItems);

      if (!result.valid) {
        return ApiErrors.badRequest(result.error ?? "Invalid coupon code");
      }

      const couponDoc = result.coupon as
        | {
            id?: string;
            scope?: string;
            storeId?: string;
            restrictions?: { combineWithSellerCoupons?: boolean };
          }
        | undefined;

      const incomingScope = (couponDoc?.scope ?? "admin") as "admin" | "seller";
      const combineFlag = couponDoc?.restrictions?.combineWithSellerCoupons;

      // Conflict detection against all currently applied coupons
      const conflict = detectConflict(existingCoupons, {
        code: normalised,
        scope: incomingScope,
        storeId: couponDoc?.storeId,
        combineWithSellerCoupons: combineFlag,
      });
      if (conflict) {
        return ApiErrors.badRequest(conflict);
      }

      // Map eligible product IDs â†’ itemIds stored on the coupon for checkout use
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
        storeId: couponDoc?.storeId,
        applicableItemIds,
        // Store the combine flag so conflict detection works for future coupons
        combineWithSellerCoupons: combineFlag,
      });

      // Auto-bind to the user's wallet â€” if they typed a code they hadn't
      // claimed yet, this surfaces it under My Coupons so they can reapply
      // later without re-typing. claim() is idempotent so re-applying an
      // already-claimed coupon is a no-op.
      if (couponDoc?.id) {
        const fullCoupon = result.coupon as CouponDocument | undefined;
        void claimedCouponsRepository
          .claim({
            userId: user!.uid,
            couponId: couponDoc.id,
            couponCode: normalised,
            source: "manual",
            couponSnapshot: {
              name: fullCoupon?.name ?? normalised,
              description: fullCoupon?.description,
              type: fullCoupon?.type ?? "fixed",
              scope: fullCoupon?.scope ?? incomingScope,
              storeId: fullCoupon?.storeId,
              discount: fullCoupon?.discount ?? { value: result.discountAmount ?? 0 },
              restrictions: fullCoupon?.restrictions ?? {
                firstTimeUserOnly: false,
                combineWithSellerCoupons: true,
              },
            },
            expiresAt: fullCoupon?.validity?.endDate ?? null,
          })
          .catch(() => {
            /* best-effort wallet bind â€” checkout still validates fresh */
          });
      }

      return successResponse({
        code: normalised,
        discountAmount: result.discountAmount,
        eligibleSubtotal: result.eligibleSubtotal,
        couponId: couponDoc?.id,
        scope: incomingScope,
        storeId: couponDoc?.storeId,
        applicableItemIds,
      });
    },
  }),
);

// DELETE /api/cart/coupon â€” remove one coupon by code, or all if no code given
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