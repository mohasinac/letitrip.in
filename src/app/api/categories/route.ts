/**
 * Categories API Routes
 *
 * GET delegated to @mohasinac/feat-categories.
 * POST stays local (admin auth, hierarchy calculation).
 */

export { GET } from "@mohasinac/feat-categories";

import { categoriesRepository } from "@/repositories";
import { successResponse } from "@/lib/api-response";
import { categoryCreateSchema } from "@/lib/validation/schemas";
import { SUCCESS_MESSAGES } from "@/constants";
import { CategoryCreateInput } from "@/db/schema/categories";
import { createApiHandler } from "@/lib/api/api-handler";

/**
 * POST /api/categories
 *
 * Create new category
 *
 * Body:
 * - name: string (required)
 * - parentId: string (optional)
 * - description: string (optional)
 * - display: object (icon, color, showInMenu, etc.)
 * - seo: object (title, description, keywords)
 *
 * Features:
 * - Admin only authentication
 * - Zod validation
 * - Auto-calculate hierarchy (tier, path, parentIds, rootId)
 * - Auto-update parent's childrenIds
 * - Generate SEO-friendly slug
 *
 * TODO (Future) - Phase 3:
 * - Send notification on category creation
 * - Implement category templates
 */
export const POST = createApiHandler<(typeof categoryCreateSchema)["_output"]>({
  auth: true,
  roles: ["admin"],
  schema: categoryCreateSchema,
  handler: async ({ user, body }) => {
    const categoryData: CategoryCreateInput = {
      ...body!,
      createdBy: user!.uid,
      isActive: true,
      isSearchable: true,
      order: 0,
      isFeatured: false,
      featuredPriority: 0,
      rootId: "",
      parentIds: body!.parentId ? [body!.parentId] : [],
      childrenIds: [],
      tier: 0,
      path: "",
      slug: "",
      seo: {
        title: body!.seo?.title || body!.name,
        description:
          body!.seo?.description ||
          body!.description ||
          `Browse ${body!.name} category`,
        keywords: body!.seo?.keywords || [],
      },
      display: body!.display || {
        showInMenu: true,
        showInFooter: false,
      },
    };
    const category =
      await categoriesRepository.createWithHierarchy(categoryData);
    return successResponse(category, SUCCESS_MESSAGES.CATEGORY.CREATED, 201);
  },
});
