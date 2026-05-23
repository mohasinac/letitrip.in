import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  ApiErrors,
  shippingConfigsRepository,
  storeRepository,
} from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

async function loadAndAssertOwner(uid: string, id: string) {
  const store = await storeRepository.findByOwnerId(uid);
  if (!store) return { error: ApiErrors.forbidden("No store") };
  const doc = await shippingConfigsRepository.findById(id);
  if (!doc) return { error: ApiErrors.notFound("Not found") };
  if (doc.storeId !== store.id) return { error: ApiErrors.forbidden("Not your store") };
  return { doc };
}

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ user, params }) => {
      const { error, doc } = await loadAndAssertOwner(user!.uid, (params as { id: string }).id);
      if (error) return error;
      return successResponse(doc);
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ request, user, params }) => {
      const { error } = await loadAndAssertOwner(user!.uid, (params as { id: string }).id);
      if (error) return error;
      const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
      try {
        const updated = await shippingConfigsRepository.update(
          (params as { id: string }).id,
          body,
        );
        return successResponse(updated, "Updated");
      } catch (err) {
        return errorResponse(err instanceof Error ? err.message : "Update failed", 400);
      }
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ user, params }) => {
      const { error } = await loadAndAssertOwner(user!.uid, (params as { id: string }).id);
      if (error) return error;
      await shippingConfigsRepository.delete((params as { id: string }).id);
      return successResponse({ deleted: true }, "Deleted");
    },
  }),
);
