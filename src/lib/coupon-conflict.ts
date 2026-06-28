import type { CartAppliedCoupon } from "@mohasinac/appkit";

/**
 * Detects coupon stacking conflicts before adding a coupon to the cart.
 *
 * Rules:
 *  1. Same code already applied → duplicate (defence-in-depth).
 *  2. Two seller coupons for the same store don't stack.
 *  3. Admin coupon with combineWithSellerCoupons=false → conflicts with any
 *     existing seller coupon.
 *  4. Seller coupon incoming → conflicts with any existing admin coupon that
 *     has combineWithSellerCoupons=false.
 *
 * Returns a human-readable conflict message or null when no conflict exists.
 */
export function detectConflict(
  existing: CartAppliedCoupon[],
  incoming: {
    code: string;
    scope: "admin" | "seller";
    storeId?: string;
    combineWithSellerCoupons?: boolean;
  },
): string | null {
  for (const applied of existing) {
    if (applied.code === incoming.code) {
      return `Coupon ${incoming.code} is already applied.`;
    }

    if (
      incoming.scope === "seller" &&
      applied.scope === "seller" &&
      applied.storeId === incoming.storeId
    ) {
      return `A coupon for this store is already applied (${applied.code}). Remove it first.`;
    }

    if (
      incoming.scope === "admin" &&
      incoming.combineWithSellerCoupons === false &&
      applied.scope === "seller"
    ) {
      return `${incoming.code} cannot be combined with the seller coupon ${applied.code}. Remove it first.`;
    }

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
