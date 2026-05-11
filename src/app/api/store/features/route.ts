import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  ApiErrors,
  productFeaturesRepository,
  storeRepository,
  MAX_STORE_CUSTOM_FEATURES,
  productFeatureStoreCreateSchema,
  type ProductFeatureStoreCreatePayload,
  ERROR_MESSAGES,
} from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["seller", "admin"],
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
    roles: ["seller", "admin"],
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
