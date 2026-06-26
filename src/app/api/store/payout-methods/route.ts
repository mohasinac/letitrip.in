import { normalizeError } from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";
import {
  ApiErrors,
  createRouteHandler,
  errorResponse,
  parseJsonBody,
  type JsonValue,
  payoutMethodsRepository,
  storeRepository,
  successResponse,
} from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
  permission: "store:api:write",
    handler: async ({ user }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store");
      const result = await payoutMethodsRepository.listByStore(store.id);
      return successResponse({ items: result.items, total: result.items.length });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
  permission: "store:api:write",
    handler: async ({ request, user }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store");
      const body = await parseJsonBody<Record<string, JsonValue>>(request);
      try {
        const doc = await payoutMethodsRepository.create({
          ...body,
          storeId: store.id,
          sellerId: user!.uid,
        });
        return successResponse(doc, "Payout method created", 201);
      } catch (err) {
        void normalizeError(err);
        return errorResponse(
          err instanceof Error ? err.message : "Create failed",
          400,
        );
      }
    },
  }),
);
