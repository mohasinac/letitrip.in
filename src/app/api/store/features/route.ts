import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  ApiErrors,
  productFeaturesRepository,
  storeRepository,
  MAX_STORE_CUSTOM_FEATURES,
} from "@mohasinac/appkit";

const productTypeEnum = z.enum(["product", "auction", "preorder", "all"]);
const categoryEnum = z.enum([
  "shipping",
  "seller",
  "condition",
  "platform",
  "auction",
  "preorder",
  "custom",
]);

const createSchema = z.object({
  label: z.string().min(1).max(80),
  description: z.string().max(500).optional(),
  icon: z.string().min(1).max(2000),
  iconColor: z.string().max(80).optional(),
  category: categoryEnum,
  productTypes: z.array(productTypeEnum).min(1),
  isActive: z.boolean(),
  displayOrder: z.number().int().min(0).max(10_000),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["seller", "admin"],
    handler: async ({ user }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store found for this account");
      const items = await productFeaturesRepository.listFiltered({
        scope: "store",
        storeId: store.id,
      });
      return successResponse({
        items,
        total: items.length,
        limit: MAX_STORE_CUSTOM_FEATURES,
        isFull: items.length >= MAX_STORE_CUSTOM_FEATURES,
      });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler<(typeof createSchema)["_output"]>({
    auth: true,
    roles: ["seller", "admin"],
    schema: createSchema,
    handler: async ({ body, user }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store found for this account");
      try {
        const doc = await productFeaturesRepository.create({
          ...body!,
          scope: "store",
          storeId: store.id,
        });
        return successResponse(doc, "Feature created", 201);
      } catch (err) {
        return errorResponse(
          err instanceof Error ? err.message : "Failed to create feature",
          err instanceof Error && err.message.toLowerCase().includes("maximum")
            ? 409
            : 400,
        );
      }
    },
  }),
);
