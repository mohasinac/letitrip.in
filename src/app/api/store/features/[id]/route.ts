import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  ApiErrors,
  productFeaturesRepository,
  storeRepository,
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

const updateSchema = z.object({
  label: z.string().min(1).max(80).optional(),
  description: z.string().max(500).optional(),
  icon: z.string().min(1).max(2000).optional(),
  iconColor: z.string().max(80).optional(),
  category: categoryEnum.optional(),
  productTypes: z.array(productTypeEnum).min(1).optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().min(0).max(10_000).optional(),
});

async function loadStoreFeatureOrError(id: string, uid: string) {
  const store = await storeRepository.findByOwnerId(uid);
  if (!store)
    return { error: ApiErrors.forbidden("No store found for this account") };
  const doc = await productFeaturesRepository.findById(id);
  if (!doc) return { error: errorResponse("Feature not found", 404) };
  if (doc.scope !== "store" || doc.storeId !== store.id) {
    return { error: ApiErrors.forbidden("This feature is not owned by your store") };
  }
  return { store, doc };
}

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["seller", "admin"],
    handler: async ({ params, user }) => {
      const id = (params as { id: string }).id;
      const result = await loadStoreFeatureOrError(id, user!.uid);
      if ("error" in result && result.error) return result.error;
      return successResponse(result.doc);
    },
  }),
);

export const PUT = withProviders(
  createRouteHandler<(typeof updateSchema)["_output"]>({
    auth: true,
    roles: ["seller", "admin"],
    schema: updateSchema,
    handler: async ({ body, params, user }) => {
      const id = (params as { id: string }).id;
      const result = await loadStoreFeatureOrError(id, user!.uid);
      if ("error" in result && result.error) return result.error;
      const updated = await productFeaturesRepository.update(id, body!);
      return successResponse(updated, "Feature updated");
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["seller", "admin"],
    handler: async ({ params, user }) => {
      const id = (params as { id: string }).id;
      const result = await loadStoreFeatureOrError(id, user!.uid);
      if ("error" in result && result.error) return result.error;
      try {
        await productFeaturesRepository.delete(id);
        return successResponse(null, "Feature deleted");
      } catch (err) {
        return errorResponse(
          err instanceof Error ? err.message : "Failed to delete feature",
          409,
        );
      }
    },
  }),
);
