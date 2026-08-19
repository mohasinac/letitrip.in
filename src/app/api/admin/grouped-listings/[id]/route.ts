/**
 * GET / DELETE /api/admin/grouped-listings/[id] — admin moderation endpoint.
 * Seller-scoped CRUD lives at /api/store/grouped-listings/[id].
 */
import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  errorResponse,
  successResponse,
  groupedListingsRepository,
  type GroupedListingDocument,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants";

const updateGroupedListingSchema = z.object({
  productIds: z.array(z.string()).optional(),
});

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
    permission: "admin:content:write",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      await groupedListingsRepository.delete(id);
      return successResponse({ id });
    },
  }),
);
