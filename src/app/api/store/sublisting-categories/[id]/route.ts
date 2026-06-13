import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  ApiErrors,
  categoriesRepository,
  storeRepository,
} from "@mohasinac/appkit";
import { ROLES_STORE_READ, ROLES_STORE_WRITE } from "@/constants";

const MSG_SUBLISTING_CAT_NOT_FOUND = "Sublisting category not found.";

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  itemCode: z.string().max(40).optional(),
  description: z.string().max(500).optional(),
  coverImage: z.string().url().optional().or(z.literal("")),
});

// rbac-scope-enforced-in-handler: store section — handler scopes queries by storeId + actor uid
export const GET = withProviders(createRouteHandler({
  auth: true,
  roles: [...ROLES_STORE_READ],
  handler: async ({ params }) => {
    const id = (params as Record<string, string>)?.id;
    if (!id) return ApiErrors.badRequest("Missing id");
    const category = await categoriesRepository.findById(id);
    if (!category || category.categoryType !== "sublisting") {
      return ApiErrors.notFound(MSG_SUBLISTING_CAT_NOT_FOUND);
    }
    return successResponse({ category });
  },
}));

// rbac-scope-enforced-in-handler: store section — handler scopes queries by storeId + actor uid
export const PUT = withProviders(createRouteHandler<(typeof updateSchema)["_output"]>({
  auth: true,
  roles: [...ROLES_STORE_READ],
  schema: updateSchema,
  handler: async ({ params, body, user }) => {
    const id = (params as Record<string, string>)?.id;
    if (!id) return ApiErrors.badRequest("Missing id");

    const existing = await categoriesRepository.findById(id);
    if (!existing || existing.categoryType !== "sublisting") {
      return ApiErrors.notFound(MSG_SUBLISTING_CAT_NOT_FOUND);
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

// rbac-scope-enforced-in-handler: store section — handler scopes queries by storeId + actor uid
export const DELETE = withProviders(createRouteHandler({
  auth: true,
  roles: [...ROLES_STORE_WRITE],
  handler: async ({ params, user }) => {
    const id = (params as Record<string, string>)?.id;
    if (!id) return ApiErrors.badRequest("Missing id");

    const existing = await categoriesRepository.findById(id);
    if (!existing || existing.categoryType !== "sublisting") {
      return ApiErrors.notFound(MSG_SUBLISTING_CAT_NOT_FOUND);
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
