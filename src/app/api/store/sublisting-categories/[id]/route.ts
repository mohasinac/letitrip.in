import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  ApiErrors,
  categoriesRepository,
  storeRepository,
} from "@mohasinac/appkit";

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
    const category = await categoriesRepository.findById(id);
    if (!category || category.categoryType !== "sublisting") {
      return ApiErrors.notFound("Sub-listing category not found");
    }
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

    const existing = await categoriesRepository.findById(id);
    if (!existing || existing.categoryType !== "sublisting") {
      return ApiErrors.notFound("Sub-listing category not found");
    }

    if (user!.role === "seller") {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store || existing.createdBy !== store.id) {
        return ApiErrors.forbidden("You can only edit categories you created");
      }
    }

    const patch: Record<string, unknown> = { updatedAt: new Date() };
    if (body?.name !== undefined) patch.name = body.name;
    if (body?.itemCode !== undefined) patch.itemCode = body.itemCode;
    if (body?.description !== undefined) patch.description = body.description;
    if (body?.coverImage !== undefined) {
      patch.display = { ...existing.display, coverImage: body.coverImage };
    }
    await categoriesRepository.update(id, patch);
    const updated = await categoriesRepository.findById(id);
    return successResponse({ category: updated });
  },
}));

export const DELETE = withProviders(createRouteHandler({
  auth: true,
  roles: ["seller", "admin"],
  handler: async ({ params, user }) => {
    const id = (params as Record<string, string>)?.id;
    if (!id) return ApiErrors.badRequest("Missing id");

    const existing = await categoriesRepository.findById(id);
    if (!existing || existing.categoryType !== "sublisting") {
      return ApiErrors.notFound("Sub-listing category not found");
    }

    if (user!.role === "seller") {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store || existing.createdBy !== store.id) {
        return ApiErrors.forbidden("You can only delete categories you created");
      }
    }

    await categoriesRepository.deleteWithSublistingUnlink(id);
    return successResponse({ deleted: true });
  },
}));
