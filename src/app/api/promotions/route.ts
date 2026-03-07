/**
 * Promotions API Route
 * GET /api/promotions — Returns promoted products, featured products and active coupons
 */

import { productRepository, couponsRepository } from "@/repositories";
import { successResponse } from "@/lib/api-response";
import { serverLogger } from "@/lib/server-logger";
import { createApiHandler } from "@/lib/api/api-handler";

/**
 * GET /api/promotions
 *
 * Returns:
 *  - promotedProducts: published products with isPromoted=true (limit 12)
 *  - featuredProducts: published products with featured=true (limit 8)
 *  - activeCoupons: coupons with validity.isActive=true
 */
export const GET = createApiHandler({
  handler: async () => {
    serverLogger.info("Promotions page data requested");

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

    return successResponse({
      promotedProducts,
      featuredProducts,
      activeCoupons: validCoupons,
    });
  },
});
