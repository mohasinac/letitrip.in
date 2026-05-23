import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  productFeaturesRepository,
  productFeatureAdminCreateSchema,
  type ProductFeatureAdminCreatePayload,
  ERROR_MESSAGES,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:categories:read",
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const scope = url.searchParams.get("scope") as
        | "platform"
        | "store"
        | null;
      const storeId = url.searchParams.get("storeId") || undefined;
      const isActiveParam = url.searchParams.get("isActive");
      const isActive =
        isActiveParam == null ? undefined : isActiveParam === "true";
      const items = await productFeaturesRepository.listFiltered({
        scope: scope ?? undefined,
        storeId,
        isActive,
      });
      return successResponse({ items, total: items.length });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler<ProductFeatureAdminCreatePayload>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:categories:write",
    schema: productFeatureAdminCreateSchema,
    handler: async ({ body }) => {
      try {
        const doc = await productFeaturesRepository.create(body!);
        return successResponse(doc, "Feature created");
      } catch (err) {
        return errorResponse(
          err instanceof Error
            ? err.message
            : ERROR_MESSAGES.PRODUCT_FEATURES.CREATE_FAILED,
          400,
        );
      }
    },
  }),
);
