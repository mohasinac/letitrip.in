import { withProviders } from "@/providers.config";
import {
  ApiErrors,
  analyticsCardsRepository,
  createRouteHandler,
  errorResponse,
  parseJsonBody,
  storeRepository,
  successResponse,
} from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

// rbac-scope-enforced-in-handler: store section — handler scopes queries by storeId + actor uid
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ user }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store");
      const result = await analyticsCardsRepository.listForOwner("seller", user!.uid);
      return successResponse({ items: result.items });
    },
  }),
);

// rbac-scope-enforced-in-handler: store section — handler scopes queries by storeId + actor uid
export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ request, user }) => {
      const body = await parseJsonBody<Record<string, unknown>>(request);
      try {
        const doc = await analyticsCardsRepository.create({
          ...body,
          scope: "seller",
          ownerId: user!.uid,
          isBuiltIn: false,
        });
        return successResponse(doc, "Card created", 201);
      } catch (err) {
        return errorResponse(err instanceof Error ? err.message : "Create failed", 400);
      }
    },
  }),
);
