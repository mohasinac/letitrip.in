import { z } from "zod";
import {
  productRepository,
  ProductStatusValues,
  successResponse,
  createRouteHandler,
} from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";

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

      /** Truly unpublished — remove from cart AND wishlist. */
      const stale: string[] = [];
      /**
       * Temporarily unavailable (sold/OOS/no stock) — keep in wishlist,
       * move from cart to wishlist so the user doesn't lose track.
       */
      const moveable: string[] = [];

      productIds.forEach((productId, i) => {
        const result = results[i];
        if (result.status === "rejected" || result.value === null) {
          stale.push(productId);
          return;
        }
        const { status, availableQuantity, isSold } = result.value;

        if (
          status === ProductStatusValues.ARCHIVED ||
          status === ProductStatusValues.DRAFT ||
          status === ProductStatusValues.IN_REVIEW
        ) {
          stale.push(productId);
        } else if (
          isSold ||
          (availableQuantity !== undefined && availableQuantity <= 0)
        ) {
          moveable.push(productId);
        }
      });

      return successResponse({ stale, moveable });
    },
  }),
);
