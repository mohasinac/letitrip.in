/**
 * GET / DELETE /api/admin/grouped-listings/[id] — admin moderation endpoint.
 * Seller-scoped CRUD lives at /api/store/grouped-listings/[id].
 */
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  errorResponse,
  successResponse,
  groupedListingsRepository,
  groupedListingUpdateSchema,
  type GroupedListingDocument,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants";

/**
 * 🛑 This was `z.object({ productIds })` — and `z.object()` STRIPS unknown
 * keys, so an admin saving a group's title, theme or visibility got a **200
 * that wrote nothing**. Root Cause #40's exact shape: a success response is
 * what the broken version returns, so only a reload reveals it.
 *
 * Now the same `.strict()` schema the seller route parses, so the two portals
 * cannot accept different field sets for one document. It already contains
 * `productIds`, so `AdminGroupedListingsView`'s Reassign drawer is unaffected.
 */
const updateGroupedListingSchema = groupedListingUpdateSchema;

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const doc = await groupedListingsRepository.findById(id);
      if (!doc) return errorResponse("Grouped listing not found", 404);
      return successResponse({ item: doc });
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<(typeof updateGroupedListingSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    schema: updateGroupedListingSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      const doc = await groupedListingsRepository.findById(id);
      if (!doc) return errorResponse("Grouped listing not found", 404);
      // Mirror the seller-side create/update's activeMemberCount derivation —
      // otherwise it goes stale until the unrelated onProductStockChange
      // background job happens to fire for a member product.
      const patch: Partial<GroupedListingDocument> = { ...body };
      if (body!.productIds !== undefined) {
        patch.activeMemberCount = body!.productIds.length;
      }
      const updated = await groupedListingsRepository.update(id, patch);
      return successResponse(updated, "Grouped listing updated");
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:products:write",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      await groupedListingsRepository.delete(id);
      return successResponse({ id });
    },
  }),
);
