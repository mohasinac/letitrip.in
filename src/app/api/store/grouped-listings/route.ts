import { withProviders } from "@/providers.config";
import {
  ApiErrors,
  createRouteHandler,
  errorResponse,
  groupedListingsRepository,
  storeRepository,
  successResponse,
} from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ user }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store");
      const result = await groupedListingsRepository.listByStore(store.id);
      return successResponse({ items: result.items, meta: { total: result.items.length } });
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
        const doc = await groupedListingsRepository.create({
          ...body,
          storeId: store.id,
          createdBy: user!.uid,
          isActive: body.isActive ?? true,
          isFeatured: body.isFeatured ?? false,
          productIds: Array.isArray(body.productIds) ? body.productIds : [],
          groupTheme: body.groupTheme ?? "generic",
          minActiveMembers: Number(body.minActiveMembers ?? 2),
          activeMemberCount: Array.isArray(body.productIds) ? body.productIds.length : 0,
          visibilityStatus: "visible",
        });
        return successResponse(doc, "Group created", 201);
      } catch (err) {
        return errorResponse(err instanceof Error ? err.message : "Create failed", 400);
      }
    },
  }),
);
