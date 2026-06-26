import { normalizeError } from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";
import {
  ApiErrors,
  analyticsAlertsRepository,
  createRouteHandler,
  errorResponse,
  parseJsonBody,
  type JsonValue,
  storeRepository,
  successResponse,
} from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    permission: "store:analytics:read",
    handler: async ({ user }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store");
      const result = await analyticsAlertsRepository.listForOwner("seller", user!.uid);
      return successResponse({ items: result.items });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ request, user }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store");
      const body = await parseJsonBody<Record<string, JsonValue>>(request);
      try {
        const doc = await analyticsAlertsRepository.create({
          ...body,
          scope: "seller",
          ownerId: user!.uid,
          isActive: body.isActive ?? true,
          notifyChannels: Array.isArray(body.notifyChannels) ? body.notifyChannels : ["in-app"],
        });
        return successResponse(doc, "Alert created", 201);
      } catch (err) {
        void normalizeError(err);
        return errorResponse(err instanceof Error ? err.message : "Create failed", 400);
      }
    },
  }),
);
