import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  categoriesRepository,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants";

const MSG_CATEGORY_NOT_FOUND = "Category not found.";

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  display: z
    .object({
      showInMenu: z.boolean().optional(),
      showInFooter: z.boolean().optional(),
    })
    .optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:categories:read",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const category = await categoriesRepository.findById(id);
      if (!category) return errorResponse(MSG_CATEGORY_NOT_FOUND, 404);
      return successResponse(category);
    },
  }),
);

export const PUT = withProviders(
  createRouteHandler<(typeof updateCategorySchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:categories:write",
    schema: updateCategorySchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      const existing = await categoriesRepository.findById(id);
      if (!existing) return errorResponse(MSG_CATEGORY_NOT_FOUND, 404);

      const updated = await categoriesRepository.update(id, {
        ...(body as any),
        updatedAt: new Date(),
      });
      return successResponse(updated, "Category updated");
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:categories:delete",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const existing = await categoriesRepository.findById(id);
      if (!existing) return errorResponse(MSG_CATEGORY_NOT_FOUND, 404);
      if (!existing.isLeaf) {
        return errorResponse(
          "Cannot delete a category that has subcategories. Remove all children first.",
          409,
        );
      }
      await categoriesRepository.delete(id);
      return successResponse(null, "Category deleted");
    },
  }),
);
