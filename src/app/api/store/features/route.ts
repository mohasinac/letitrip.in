import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import { withProviders } from "@/providers.config";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors/messages";
import { productFeaturesRepository } from "@mohasinac/appkit/features/products/repository/product-features.repository";
import { MAX_STORE_CUSTOM_FEATURES } from "@mohasinac/appkit/features/products/schemas/product-features";
import { productFeatureStoreCreateSchema } from "@mohasinac/appkit/features/products/schemas/product-features.validators";
import type { ProductFeatureStoreCreatePayload } from "@mohasinac/appkit/features/products/schemas/product-features.validators";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { successResponse, errorResponse, ApiErrors } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_STORE_WRITE } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ user }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store)
        return ApiErrors.forbidden(ERROR_MESSAGES.PRODUCT_FEATURES.NO_STORE);
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
  createRouteHandler<ProductFeatureStoreCreatePayload>({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    schema: productFeatureStoreCreateSchema,
    handler: async ({ body, user }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store)
        return ApiErrors.forbidden(ERROR_MESSAGES.PRODUCT_FEATURES.NO_STORE);
      try {
        const doc = await productFeaturesRepository.create({
          ...body!,
          scope: "store",
          storeId: store.id,
        });
        return successResponse(doc, "Feature created", 201);
      } catch (err) {
        void normalizeError(err);
        const message =
          err instanceof Error
            ? err.message
            : ERROR_MESSAGES.PRODUCT_FEATURES.CREATE_FAILED;
        const isCap = message.includes(
          ERROR_MESSAGES.PRODUCT_FEATURES.STORE_CAP_REACHED,
        );
        return errorResponse(message, isCap ? 409 : 400);
      }
    },
  }),
);
