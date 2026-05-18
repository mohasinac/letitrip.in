import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  ApiErrors,
  storeGoogleConfigRepository,
  storeRepository,
} from "@mohasinac/appkit";

// Sync trigger — the actual Google Places API fetch is offloaded to a Firebase
// Function (60s ceiling). This handler just queues the sync request by stamping
// `lastSyncedAt` and bumping a counter; the function reads the doc and refreshes.
export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["seller", "admin"],
    handler: async ({ user }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store");
      const existing = await storeGoogleConfigRepository.getByStore(store.id);
      if (!existing) return ApiErrors.notFound("Not configured");
      const updated = await storeGoogleConfigRepository.update(existing.id, {
        lastSyncedAt: new Date(),
      });
      return successResponse(updated, "Sync queued");
    },
  }),
);
