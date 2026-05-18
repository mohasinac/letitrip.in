import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  ApiErrors,
  storeGoogleConfigRepository,
  storeRepository,
} from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["seller", "admin"],
    handler: async ({ user }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store");
      const doc = await storeGoogleConfigRepository.getByStore(store.id);
      return successResponse(doc ?? { storeId: store.id, isConnected: false });
    },
  }),
);

export const PUT = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["seller", "admin"],
    handler: async ({ request, user }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store");
      const existing = await storeGoogleConfigRepository.getByStore(store.id);
      const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
      try {
        const doc = existing
          ? await storeGoogleConfigRepository.update(existing.id, {
              ...body,
              storeId: store.id,
            })
          : await storeGoogleConfigRepository.create({
              ...body,
              storeId: store.id,
            });
        return successResponse(doc, "Saved");
      } catch (err) {
        return errorResponse(err instanceof Error ? err.message : "Save failed", 400);
      }
    },
  }),
);
