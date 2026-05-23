import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  productFeaturesRepository,
  productFeatureUpdateSchema,
  type ProductFeatureUpdatePayload,
  ERROR_MESSAGES,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:categories:read",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const doc = await productFeaturesRepository.findById(id);
      if (!doc)
        return errorResponse(ERROR_MESSAGES.PRODUCT_FEATURES.NOT_FOUND, 404);
      return successResponse(doc);
    },
  }),
);

export const PUT = withProviders(
  createRouteHandler<ProductFeatureUpdatePayload>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:categories:write",
    schema: productFeatureUpdateSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      const existing = await productFeaturesRepository.findById(id);
      if (!existing)
        return errorResponse(ERROR_MESSAGES.PRODUCT_FEATURES.NOT_FOUND, 404);
      const updated = await productFeaturesRepository.update(id, body!);
      return successResponse(updated, "Feature updated");
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:categories:delete",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const existing = await productFeaturesRepository.findById(id);
      if (!existing)
        return errorResponse(ERROR_MESSAGES.PRODUCT_FEATURES.NOT_FOUND, 404);
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
