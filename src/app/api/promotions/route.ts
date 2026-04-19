import "@/providers.config";
/**
 * Promotions API Route
 * GET /api/promotions — Returns promoted products, featured products and active coupons
 */

import { productRepository, couponsRepository } from "@mohasinac/appkit/server";
import { successResponse } from "@mohasinac/appkit/server";
import { serverLogger } from "@mohasinac/appkit/server";
import { createRouteHandler } from "@mohasinac/appkit/server";
import { ProductStatusValues } from "@mohasinac/appkit/server";

/**
 * GET /api/promotions
 *
 * Returns:
 *  - promotedProducts: published products with isPromoted=true (limit 12)
 *  - featuredProducts: published products with featured=true (limit 8)
 *  - activeCoupons: coupons with validity.isActive=true
 */
export const GET = createRouteHandler({
  handler: async () => {
    serverLogger.info("Promotions page data requested");

    const nowIso = new Date().toISOString();

    const [promotedResult, featuredResult, activeCouponsResult] =
      await Promise.all([
        productRepository.list(
          {
            filters: `status==${ProductStatusValues.PUBLISHED},isPromoted==true`,
            sorts: "-createdAt",
            page: "1",
            pageSize: "12",
          },
          { status: ProductStatusValues.PUBLISHED },
        ),
        productRepository.list(
          {
            filters: `status==${ProductStatusValues.PUBLISHED},featured==true`,
            sorts: "-createdAt",
            page: "1",
            pageSize: "8",
          },
          { status: ProductStatusValues.PUBLISHED },
        ),
        couponsRepository.list({
          filters: `validity.isActive==true,validity.endDate>=${nowIso},validity.startDate<=${nowIso}`,
          sorts: "validity.endDate",
          page: "1",
          pageSize: "50",
        }),
      ]);

    return successResponse({
      promotedProducts: promotedResult.items,
      featuredProducts: featuredResult.items,
      activeCoupons: activeCouponsResult.items,
    });
  },
});

