import { withProviders } from "@/providers.config";
import {
  ApiErrors,
  createRouteHandler,
  errorResponse,
  groupedListingsRepository,
  parseJsonBody,
  storeRepository,
  successResponse,
} from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

const GROUP_NOT_FOUND = "Group not found";

// rbac-scope-enforced-in-handler: store section — handler scopes queries by storeId + actor uid
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
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

// rbac-scope-enforced-in-handler: store section — handler scopes queries by storeId + actor uid
export const PATCH = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ request, user, params }) => {
      const id = (params as { id: string }).id;
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store");
      const doc = await groupedListingsRepository.findById(id);
      if (!doc) return ApiErrors.notFound(GROUP_NOT_FOUND);
      if (doc.storeId !== store.id) return ApiErrors.forbidden("Not your group");
      const body = await parseJsonBody<Record<string, unknown>>(request);
      try {
        await groupedListingsRepository.update(id, body);
        return successResponse({ id }, "Group updated");
      } catch (err) {
        return errorResponse(err instanceof Error ? err.message : "Update failed", 400);
      }
    },
  }),
);

// rbac-scope-enforced-in-handler: store section — handler scopes queries by storeId + actor uid
export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
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
