import { withProviders } from "@/providers.config";
import {
  createApiHandler as createRouteHandler,
  successResponse,
  errorResponse,
  catalogueRepository,
  updateCatalogueItemSchema,
} from "@mohasinac/appkit";

/**
 * GET    /api/user/catalogue/[id]
 * PATCH  /api/user/catalogue/[id]
 * DELETE /api/user/catalogue/[id]
 *
 * Ownership-checked in-handler — any logged-in user manages only their own
 * catalogue (no special role/permission beyond auth), matching the
 * wishlist/history route pattern.
 */

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      const item = await catalogueRepository.findById(id);
      if (!item) return errorResponse("Catalogue item not found", 404);
      if (item.ownerId !== user!.uid) return errorResponse("Catalogue item not found", 404);
      return successResponse(item);
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<(typeof updateCatalogueItemSchema)["_output"]>({
    auth: true,
    schema: updateCatalogueItemSchema,
    handler: async ({ user, params, body }) => {
      const id = (params as { id: string }).id;
      const item = await catalogueRepository.findById(id);
      if (!item) return errorResponse("Catalogue item not found", 404);
      if (item.ownerId !== user!.uid) return errorResponse("Catalogue item not found", 404);
      const updated = await catalogueRepository.update(id, body! as never);
      return successResponse(updated, "Catalogue item updated");
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      const item = await catalogueRepository.findById(id);
      if (!item) return errorResponse("Catalogue item not found", 404);
      if (item.ownerId !== user!.uid) return errorResponse("Catalogue item not found", 404);
      if (item.linkedProductId) {
        return errorResponse("Cannot delete a catalogue item that is already listed", 409);
      }
      await catalogueRepository.delete(id);
      return successResponse({ id }, "Catalogue item deleted");
    },
  }),
);
