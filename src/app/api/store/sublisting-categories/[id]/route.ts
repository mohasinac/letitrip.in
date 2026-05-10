import { withProviders } from "@/providers.config";
import { z } from "zod";
import { createRouteHandler, successResponse, ApiErrors } from "@mohasinac/appkit";
import { sublistingCategoriesRepository, storeRepository } from "@mohasinac/appkit";

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  itemCode: z.string().max(40).optional(),
  description: z.string().max(500).optional(),
  coverImage: z.string().url().optional().or(z.literal("")),
});

export const GET = withProviders(createRouteHandler({
  auth: true,
  roles: ["seller", "admin", "moderator"],
  handler: async ({ params }) => {
    const id = (params as Record<string, string>)?.id;
    if (!id) return ApiErrors.badRequest("Missing id");
    const category = await sublistingCategoriesRepository.findById(id);
    if (!category) return ApiErrors.notFound("Sub-listing category not found");
    return successResponse({ category });
  },
}));

export const PUT = withProviders(createRouteHandler<(typeof updateSchema)["_output"]>({
  auth: true,
  roles: ["seller", "admin", "moderator"],
  schema: updateSchema,
  handler: async ({ params, body, user }) => {
    const id = (params as Record<string, string>)?.id;
    if (!id) return ApiErrors.badRequest("Missing id");

    const existing = await sublistingCategoriesRepository.findById(id);
    if (!existing) return ApiErrors.notFound("Sub-listing category not found");

    // Sellers can only edit categories they created; admins/moderators can edit any
    if (user!.role === "seller") {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store || existing.createdBy !== store.id) {
        return ApiErrors.forbidden("You can only edit categories you created");
      }
    }

    const updated = await sublistingCategoriesRepository.update(id, {
      name: body?.name,
      itemCode: body?.itemCode || undefined,
      description: body?.description || undefined,
      coverImage: body?.coverImage || undefined,
    });
    return successResponse({ category: updated });
  },
}));

export const DELETE = withProviders(createRouteHandler({
  auth: true,
  roles: ["seller", "admin"],
  handler: async ({ params, user }) => {
    const id = (params as Record<string, string>)?.id;
    if (!id) return ApiErrors.badRequest("Missing id");

    const existing = await sublistingCategoriesRepository.findById(id);
    if (!existing) return ApiErrors.notFound("Sub-listing category not found");

    // Sellers can only delete categories they created; admins can delete any
    if (user!.role === "seller") {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store || existing.createdBy !== store.id) {
        return ApiErrors.forbidden("You can only delete categories you created");
      }
    }

    await sublistingCategoriesRepository.delete(id);
    return successResponse({ deleted: true });
  },
}));
