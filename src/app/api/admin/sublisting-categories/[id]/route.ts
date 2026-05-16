import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  categoriesRepository,
} from "@mohasinac/appkit";

const MSG_SUBLISTING_CAT_NOT_FOUND = "Sublisting category not found.";

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  itemCode: z.string().max(40).optional(),
  description: z.string().max(2000).optional(),
  coverImage: z.string().optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
    permission: "admin:categories:read",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const doc = await categoriesRepository.findById(id);
      if (!doc || doc.categoryType !== "sublisting") {
        return errorResponse(MSG_SUBLISTING_CAT_NOT_FOUND, 404);
      }
      return successResponse(doc);
    },
  }),
);

export const PUT = withProviders(
  createRouteHandler<(typeof updateSchema)["_output"]>({
    auth: true,
    roles: ["admin"],
    permission: "admin:categories:write",
    schema: updateSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      const existing = await categoriesRepository.findById(id);
      if (!existing || existing.categoryType !== "sublisting") {
        return errorResponse(MSG_SUBLISTING_CAT_NOT_FOUND, 404);
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
      return successResponse(updated, "Sub-listing category updated");
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin"],
    permission: "admin:categories:delete",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const existing = await categoriesRepository.findById(id);
      if (!existing || existing.categoryType !== "sublisting") {
        return errorResponse(MSG_SUBLISTING_CAT_NOT_FOUND, 404);
      }
      await categoriesRepository.deleteWithSublistingUnlink(id);
      return successResponse(null, "Sub-listing category deleted");
    },
  }),
);
