import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  ApiErrors,
  productFeaturesRepository,
  storeRepository,
  productFeatureUpdateSchema,
  type ProductFeatureUpdatePayload,
  ERROR_MESSAGES,
} from "@mohasinac/appkit";

async function loadStoreFeatureOrError(id: string, uid: string) {
  const store = await storeRepository.findByOwnerId(uid);
  if (!store)
    return { error: ApiErrors.forbidden(ERROR_MESSAGES.PRODUCT_FEATURES.NO_STORE) };
  const doc = await productFeaturesRepository.findById(id);
  if (!doc)
    return { error: errorResponse(ERROR_MESSAGES.PRODUCT_FEATURES.NOT_FOUND, 404) };
  if (doc.scope !== "store" || doc.storeId !== store.id) {
    return {
      error: ApiErrors.forbidden(
        ERROR_MESSAGES.PRODUCT_FEATURES.NOT_OWNED_BY_STORE,
      ),
    };
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
  createRouteHandler<ProductFeatureUpdatePayload>({
    auth: true,
    roles: ["seller", "admin"],
    schema: productFeatureUpdateSchema,
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
          err instanceof Error
            ? err.message
            : ERROR_MESSAGES.PRODUCT_FEATURES.DELETE_FAILED,
          409,
        );
      }
    },
  }),
);
