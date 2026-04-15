"use server";

/**
 * Promotions Server Actions — Query
 *
 * Read-only action for the promotions/deals page, replacing the former
 * promotionsService → apiClient → API route chain (5 hops → 2 hops).
 */

import { productRepository, couponsRepository } from "@/repositories";
import type { ProductDocument } from "@/db/schema";
import type { CouponDocument } from "@/db/schema";

export interface PromotionsResult {
  promotedProducts: ProductDocument[];
  featuredProducts: ProductDocument[];
  activeCoupons: CouponDocument[];
}

export async function getPromotionsAction(): Promise<PromotionsResult> {
  const [promotedRaw, featuredRaw, activeCoupons] = await Promise.all([
    productRepository.findPromoted(),
    productRepository.findFeatured(),
    couponsRepository.getActiveCoupons(),
  ]);

  const promotedProducts = promotedRaw
    .filter((p) => p.status === "published")
    .slice(0, 12);

  const featuredProducts = featuredRaw
    .filter((p) => p.status === "published")
    .slice(0, 8);

  const now = new Date();
  const validCoupons = activeCoupons.filter((c) => {
    const startOk =
      !c.validity.startDate || new Date(c.validity.startDate) <= now;
    const endOk = !c.validity.endDate || new Date(c.validity.endDate) >= now;
    return startOk && endOk;
  });

  return {
    promotedProducts,
    featuredProducts,
    activeCoupons: validCoupons,
  };
}

