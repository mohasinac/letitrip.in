import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import { withProviders } from "@/providers.config";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors/messages";
import { productFeaturesRepository } from "@mohasinac/appkit/features/products/repository/product-features.repository";
import { productFeatureUpdateSchema } from "@mohasinac/appkit/features/products/schemas/product-features.validators";
import type { ProductFeatureUpdatePayload } from "@mohasinac/appkit/features/products/schemas/product-features.validators";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { successResponse, errorResponse, ApiErrors } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_STORE_WRITE } from "@/constants";

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
    roles: [...ROLES_STORE_WRITE],
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
    roles: [...ROLES_STORE_WRITE],
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
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ params, user }) => {
      const id = (params as { id: string }).id;
      const result = await loadStoreFeatureOrError(id, user!.uid);
      if ("error" in result && result.error) return result.error;
      try {
        await productFeaturesRepository.delete(id);
        return successResponse(null, "Feature deleted");
      } catch (err) {
        void normalizeError(err);
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
