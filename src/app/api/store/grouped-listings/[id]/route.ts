import { normalizeError } from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";
import {
  ApiErrors,
  createRouteHandler,
  errorResponse,
  groupedListingsRepository,
  groupedListingUpdateSchema,
  ValidationError,
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
      // Parsed, not spread. The schema is `.strict()`, so an unknown key is a
      // 400 rather than a silent write — `{...body}` previously persisted
      // anything a caller invented, including `storeId`.
      const parsed = groupedListingUpdateSchema.safeParse(body);
      if (!parsed.success) {
        throw new ValidationError(
          parsed.error.issues[0]?.message ?? "Invalid grouped listing",
          parsed.error.issues,
        );
      }
      const patch: Record<string, JsonValue> = { ...parsed.data } as Record<string, JsonValue>;
      // `activeMemberCount` is DERIVED, never accepted from the body — it is
      // what the public visibility check reads, and a caller-supplied count
      // could disagree with the array it is supposed to describe.
      if (parsed.data.productIds) {
        patch.activeMemberCount = parsed.data.productIds.length;
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
