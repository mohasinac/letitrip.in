import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  ApiErrors,
  listingTemplatesRepository,
  storeRepository,
} from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ user }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store");
      const result = await listingTemplatesRepository.listByStore(store.id);
      return successResponse({ items: result.items, total: result.items.length });
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
      const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
      try {
        const doc = await listingTemplatesRepository.create({
          ...body,
          storeId: store.id,
          ownerId: user!.uid,
        });
        return successResponse(doc, "Template created", 201);
      } catch (err) {
        return errorResponse(err instanceof Error ? err.message : "Create failed", 400);
      }
    },
  }),
);
