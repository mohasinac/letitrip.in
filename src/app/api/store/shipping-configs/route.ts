import { normalizeError } from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";
import {
  ApiErrors,
  createRouteHandler,
  errorResponse,
  parseJsonBody,
  type FirestoreDocument,
  shippingConfigsRepository,
  shippingConfigCreateSchema,
  ValidationError,
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
      const result = await shippingConfigsRepository.listByStore(store.id);
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
      // Parse, don't spread. This used to write the raw request body straight
      // into Firestore: nothing checked required fields, and any key a caller
      // invented was persisted verbatim.
      const body = await parseJsonBody<FirestoreDocument>(request);
      const parsed = shippingConfigCreateSchema.safeParse(body);
      if (!parsed.success) {
        throw new ValidationError(
          parsed.error.issues[0]?.message ?? "Invalid shipping rule",
          parsed.error.issues,
        );
      }
      try {
        const doc = await shippingConfigsRepository.create({
          ...parsed.data,
          // From the session, never the body.
          storeId: store.id,
        });
        return successResponse(doc, "Shipping config created", 201);
      } catch (err) {
        void normalizeError(err);
        return errorResponse(err instanceof Error ? err.message : "Create failed", 400);
      }
    },
  }),
);
