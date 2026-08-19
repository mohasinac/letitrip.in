import { normalizeError } from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";
import {
  ApiErrors,
  createRouteHandler,
  errorResponse,
  groupedListingsRepository,
  parseJsonBody,
  type JsonValue,
  storeRepository,
  successResponse,
} from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

const GROUP_NOT_FOUND = "Group not found";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    permission: "store:api:write",
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store");
      const doc = await groupedListingsRepository.findById(id);
      if (!doc) return ApiErrors.notFound(GROUP_NOT_FOUND);
      if (doc.storeId !== store.id) return ApiErrors.forbidden("Not your group");
      return successResponse(doc);
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    permission: "store:api:write",
    handler: async ({ request, user, params }) => {
      const id = (params as { id: string }).id;
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store");
      const doc = await groupedListingsRepository.findById(id);
      if (!doc) return ApiErrors.notFound(GROUP_NOT_FOUND);
      if (doc.storeId !== store.id) return ApiErrors.forbidden("Not your group");
      const body = await parseJsonBody<Record<string, JsonValue>>(request);
      // Mirror POST's coercion + derived-field logic (route.ts:45-48) — without
      // this, a PATCH with a malformed productIds/minActiveMembers writes them
      // uncoerced, and activeMemberCount goes stale until the unrelated
      // onProductStockChange background job happens to fire for a member product.
      const patch: Record<string, JsonValue> = { ...body };
      if ("productIds" in body) {
        const productIds = Array.isArray(body.productIds) ? body.productIds : [];
        patch.productIds = productIds;
        patch.activeMemberCount = productIds.length;
      }
      if ("minActiveMembers" in body) {
        patch.minActiveMembers = Number(body.minActiveMembers ?? 2);
      }
      try {
        await groupedListingsRepository.update(id, patch);
        return successResponse({ id }, "Group updated");
      } catch (err) {
        void normalizeError(err);
        return errorResponse(err instanceof Error ? err.message : "Update failed", 400);
      }
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    permission: "store:api:write",
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store");
      const doc = await groupedListingsRepository.findById(id);
      if (!doc) return ApiErrors.notFound(GROUP_NOT_FOUND);
      if (doc.storeId !== store.id) return ApiErrors.forbidden("Not your group");
      await groupedListingsRepository.delete(id);
      return successResponse({ id }, "Group deleted");
    },
  }),
);
