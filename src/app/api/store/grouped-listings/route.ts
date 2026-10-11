import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import { withProviders } from "@/providers.config";
import { ValidationError } from "@mohasinac/appkit/errors/validation-error";
import { groupedListingsRepository } from "@mohasinac/appkit/features/grouped/repository/grouped-listings.repository";
import { groupedListingCreateSchema } from "@mohasinac/appkit/features/grouped/schemas/grouped-listing-form";
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
      // Parse, don't spread. This used to write the raw request body straight
      // into Firestore: nothing checked required fields, and any key a caller
      // invented was persisted verbatim.
      const body = await parseJsonBody<Record<string, JsonValue>>(request);
      const parsed = groupedListingCreateSchema.safeParse(body);
      if (!parsed.success) {
        throw new ValidationError(
          parsed.error.issues[0]?.message ?? "Invalid grouped listing",
          parsed.error.issues,
        );
      }
      try {
        const doc = await groupedListingsRepository.create({
          ...parsed.data,
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
        void normalizeError(err);
        return errorResponse(err instanceof Error ? err.message : "Create failed", 400);
      }
    },
  }),
);
