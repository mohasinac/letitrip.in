import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import { withProviders } from "@/providers.config";
import { ValidationError } from "@mohasinac/appkit/errors/validation-error";
import { storeCategoriesRepository } from "@mohasinac/appkit/features/store-extensions/repository/store-extensions.repositories";
import { storeCategoryCreateSchema } from "@mohasinac/appkit/features/store-extensions/schemas/store-category-form";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { ApiErrors, errorResponse, successResponse } from "@mohasinac/appkit/next/api/api-response";
import { parseJsonBody } from "@mohasinac/appkit/next/api/parseJsonBody";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import type { JsonValue } from "@mohasinac/appkit/schemas/types";
import { ROLES_STORE_WRITE } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ user }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store");
      const result = await storeCategoriesRepository.listByStore(store.id);
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
      const body = await parseJsonBody<Record<string, JsonValue>>(request);
      // Parse, don't spread. This used to write the raw request body straight
      // into Firestore, so any key a caller invented was persisted verbatim —
      // and nothing checked that `label` was even present, so an entirely
      // empty storefront category could be created.
      const parsed = storeCategoryCreateSchema.safeParse(body);
      if (!parsed.success) {
        // ValidationError, not errorResponse: `handleApiError` turns it into a
        // structured 400 carrying `issues[]`, which is what lets the form map
        // each failure onto the field that caused it. A flat message string
        // would throw the field paths away and force a generic banner.
        throw new ValidationError(
          parsed.error.issues[0]?.message ?? "Invalid store category",
          parsed.error.issues,
        );
      }
      try {
        const doc = await storeCategoriesRepository.create({
          ...parsed.data,
          // From the session, never the body — otherwise a seller could write
          // a category into another store by adding a `storeId` field.
          storeId: store.id,
        });
        return successResponse(doc, "Store category created", 201);
      } catch (err) {
        void normalizeError(err);
        return errorResponse(err instanceof Error ? err.message : "Create failed", 400);
      }
    },
  }),
);
