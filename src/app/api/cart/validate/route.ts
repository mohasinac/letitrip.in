import { withProviders } from "@/providers.config";
/**
 * POST /api/cart/validate
 *
 * No auth required — works for both guest and authenticated carts.
 *
 * Body: { productIds: string[] }  (max 50)
 *
 * Returns:
 *  stale       – productIds that should be REMOVED (product deleted, sold, archived, discontinued, draft)
 *  outOfStock  – productIds that should be flagged but NOT removed (status == out_of_stock)
 */
import { z } from "zod";
import {
  productRepository,
  ProductStatusValues,
  successResponse,
  createRouteHandler,
} from "@mohasinac/appkit";

const validateSchema = z.object({
  productIds: z.array(z.string().min(1)).min(1).max(50),
});

export const POST = withProviders(
  createRouteHandler<(typeof validateSchema)["_output"]>({
    auth: false,
    schema: validateSchema,
    handler: async ({ body }) => {
      const { productIds } = body!;

      const results = await Promise.allSettled(
        productIds.map((id) => productRepository.findById(id)),
      );

      const stale: string[] = [];
      const outOfStock: string[] = [];

      productIds.forEach((productId, i) => {
        const result = results[i];
        if (result.status === "rejected" || result.value === null) {
          stale.push(productId);
          return;
        }
        const status = result.value.status;
        if (status === ProductStatusValues.OUT_OF_STOCK) {
          outOfStock.push(productId);
        } else if (
          status !== ProductStatusValues.PUBLISHED
        ) {
          // SOLD, ARCHIVED, DISCONTINUED, DRAFT → stale
          stale.push(productId);
        }
      });

      return successResponse({ stale, outOfStock });
    },
  }),
);
