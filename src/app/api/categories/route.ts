/**
 * Categories API Routes
 *
 * Handles category hierarchy management
 *
 * TODO (Future) - Phase 2:
 * - Implement tree traversal optimization
 * - Add caching for entire category tree
 * - Implement category metrics calculation (product counts)
 * - Add search/filter capabilities
 * - Implement bulk operations (reorder, move subtree)
 * - Add category import/export functionality
 * - Implement SEO-friendly URL generation
 */

import { categoriesRepository } from "@/repositories";
import { errorResponse, successResponse } from "@/lib/api-response";
import {
  getBooleanParam,
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@/lib/api/request-helpers";
import { categoryCreateSchema } from "@/lib/validation/schemas";
import { NotFoundError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { CategoryCreateInput } from "@/db/schema/categories";
import { createApiHandler } from "@/lib/api/api-handler";

/**
 * GET /api/categories
 *
 * Get category tree or filtered categories
 *
 * Query Parameters:
 * - rootId: string (optional, get specific tree)
 * - parentId: string (optional, get children of parent)
 * - featured: boolean (optional, get only featured)
 * - includeMetrics: boolean (optional, include product counts)
 * - flat: boolean (optional, return flat list instead of tree)
 *
 * Features:
 * - Build hierarchical tree structure
 * - Filter by root, parent, or featured
 * - Return nested or flat structure
 * - Public access (no authentication required)
 *
 * TODO (Future) - Phase 3:
 * - Add caching with 5-minute TTL
 * - Add pagination for flat lists
 */
export const GET = createApiHandler({
  handler: async ({ request }) => {
    const searchParams = getSearchParams(request);
    const rootId = getStringParam(searchParams, "rootId");
    const parentId = getStringParam(searchParams, "parentId");
    const slug = getStringParam(searchParams, "slug");
    const featured = getBooleanParam(searchParams, "featured") === true;
    const flat = getBooleanParam(searchParams, "flat") === true;
    const tierParam = searchParams.get("tier");
    const tier =
      tierParam !== null ? Number.parseInt(tierParam, 10) : undefined;
    const pageSize = getNumberParam(searchParams, "pageSize", 0, {
      min: 0,
      max: 200,
    });

    // Slug-based single-category lookup
    if (slug) {
      const category = await categoriesRepository.getCategoryBySlug(slug);
      if (!category) {
        throw new NotFoundError(ERROR_MESSAGES.CATEGORY.NOT_FOUND);
      }
      return successResponse(category);
    }

    // Tier-based flat list (e.g. ?tier=0 for root categories on homepage)
    if (typeof tier === "number" && !Number.isNaN(tier)) {
      let tierCategories = await categoriesRepository.getCategoriesByTier(tier);
      tierCategories.sort((a, b) => a.order - b.order);
      if (pageSize > 0) tierCategories = tierCategories.slice(0, pageSize);
      const tierResponse = successResponse(tierCategories, undefined, 200, {
        total: tierCategories.length,
      });
      tierResponse.headers.set(
        "Cache-Control",
        "public, max-age=300, s-maxage=600, stale-while-revalidate=120",
      );
      return tierResponse;
    }

    // Get categories based on filters
    let categories;

    if (parentId) {
      // Get direct children of specific parent — Firestore-native
      categories = await categoriesRepository.getChildren(parentId);
    } else if (featured) {
      // Get featured categories
      categories = await categoriesRepository.findBy("isFeatured", true);
    } else if (rootId) {
      // Get categories by root ID
      categories = await categoriesRepository.getCategoriesByRootId(rootId);
    } else {
      // For flat requests load all; for tree requests, buildTree fetches its own data
      categories = flat ? await categoriesRepository.findAll() : [];
    }

    // Sort by order
    categories.sort((a, b) => a.order - b.order);

    // Return flat list or tree structure
    if (flat) {
      const flatResponse = successResponse(categories, undefined, 200, {
        total: categories.length,
      });
      flatResponse.headers.set(
        "Cache-Control",
        "public, max-age=300, s-maxage=600, stale-while-revalidate=120",
      );
      return flatResponse;
    }

    // Build tree structure — buildTree fetches its own optimised query
    const tree = await categoriesRepository.buildTree(rootId);

    const treeResponse = successResponse(tree, undefined, 200, {
      // When a parentId/rootId/featured filter is active, categories holds
      // the filtered set. For the default (no filter) tree path, use tree.length.
      total: categories.length > 0 ? categories.length : tree.length,
    });
    treeResponse.headers.set(
      "Cache-Control",
      "public, max-age=300, s-maxage=600, stale-while-revalidate=120",
    );
    return treeResponse;
  },
});

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
