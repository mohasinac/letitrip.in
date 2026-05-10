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
        } else if (status !== ProductStatusValues.PUBLISHED) {
          stale.push(productId); // SOLD, ARCHIVED, DISCONTINUED, DRAFT
        }
      });

      return successResponse({ stale, outOfStock });
    },
  }),
);
