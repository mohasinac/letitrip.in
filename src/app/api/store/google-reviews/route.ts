import { withProviders } from "@/providers.config";
import {
  ApiErrors,
  createRouteHandler,
  toSellerGoogleConfig,
  storeGoogleConfigRepository,
  storeGoogleConfigUpdateSchema,
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
      const doc = await storeGoogleConfigRepository.getByStore(store.id);
      return successResponse(
        // Allow-list projection, not the raw document — see
        // `toSellerGoogleConfig`. The GET used to return the whole thing,
        // including the Google OAuth refresh token.
        doc ? toSellerGoogleConfig(doc) : { storeId: store.id, isConnected: false },
      );
    },
  }),
);

export const PUT = withProviders(
  createRouteHandler<(typeof storeGoogleConfigUpdateSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    schema: storeGoogleConfigUpdateSchema,
    handler: async ({ user, body }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store");
      const existing = await storeGoogleConfigRepository.getByStore(store.id);

      // The schema is `.strict()` and declares neither `oauthRefreshToken` nor
      // the sync-output fields (`averageRating`, `totalReviews`,
      // `lastSyncedAt`), so a body carrying any of them is a 400 rather than a
      // seller writing the review count their own storefront displays.
      const doc = existing
        ? await storeGoogleConfigRepository.update(existing.id, {
            ...body!,
            storeId: store.id,
          })
        : await storeGoogleConfigRepository.create({
            ...body!,
            isConnected: body!.isConnected ?? false,
            storeId: store.id,
          });
      return successResponse(toSellerGoogleConfig(doc), "Saved");
    },
  }),
);
