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

import { NextRequest, NextResponse } from "next/server";
import { categoriesRepository } from "@/repositories";
import { errorResponse, successResponse } from "@/lib/api-response";
import {
  getBooleanParam,
  getSearchParams,
  getStringParam,
} from "@/lib/api/request-helpers";
import { requireRoleFromRequest } from "@/lib/security/authorization";
import {
  validateRequestBody,
  formatZodErrors,
  categoryCreateSchema,
} from "@/lib/validation/schemas";
import { AuthenticationError, AuthorizationError } from "@/lib/errors";
import { handleApiError } from "@/lib/errors/error-handler";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { CategoryCreateInput } from "@/db/schema/categories";

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
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = getSearchParams(request);
    const rootId = getStringParam(searchParams, "rootId");
    const parentId = getStringParam(searchParams, "parentId");
    const featured = getBooleanParam(searchParams, "featured") === true;
    const flat = getBooleanParam(searchParams, "flat") === true;

    // Get categories based on filters
    let categories;

    if (parentId) {
      // Get children of specific parent
      const allCategories = await categoriesRepository.findAll();
      categories = allCategories.filter(
        (cat) => cat.parentIds[cat.parentIds.length - 1] === parentId,
      );
    } else if (featured) {
      // Get featured categories
      categories = await categoriesRepository.findBy("isFeatured", true);
    } else if (rootId) {
      // Get categories by root ID
      categories = await categoriesRepository.getCategoriesByRootId(rootId);
    } else {
      // Get all categories
      categories = await categoriesRepository.findAll();
    }

    // Sort by order
    categories.sort((a, b) => a.order - b.order);

    // Return flat list or tree structure
    if (flat) {
      return NextResponse.json(
        {
          success: true,
          data: categories,
          meta: {
            total: categories.length,
          },
        },
        {
          headers: {
            "Cache-Control":
              "public, max-age=300, s-maxage=600, stale-while-revalidate=120",
          },
        },
      );
    }

    // Build tree structure
    const tree = await categoriesRepository.buildTree(rootId);

    return NextResponse.json(
      {
        success: true,
        data: tree,
        meta: {
          total: categories.length,
        },
      },
      {
        headers: {
          "Cache-Control":
            "public, max-age=300, s-maxage=600, stale-while-revalidate=120",
        },
      },
    );
  } catch (error) {
    serverLogger.error("GET /api/categories error", { error });
    return errorResponse(ERROR_MESSAGES.CATEGORY.FETCH_FAILED, 500);
  }
}

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
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const user = await requireRoleFromRequest(request, ["admin"]);

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequestBody(categoryCreateSchema, body);

    if (!validation.success) {
      return errorResponse(
        ERROR_MESSAGES.VALIDATION.FAILED,
        400,
        formatZodErrors(validation.errors),
      );
    }

    // Create category with hierarchy calculation
    const categoryData: CategoryCreateInput = {
      ...validation.data,
      createdBy: user.uid,
      isActive: true,
      isSearchable: true,
      order: 0,
      isFeatured: false,
      featuredPriority: 0,
      rootId: "", // Will be calculated by createWithHierarchy
      parentIds: validation.data.parentId ? [validation.data.parentId] : [],
      childrenIds: [],
      tier: 0, // Will be calculated
      path: "", // Will be calculated
      slug: "", // Will be calculated
      seo: {
        title: validation.data.seo?.title || validation.data.name,
        description:
          validation.data.seo?.description ||
          validation.data.description ||
          `Browse ${validation.data.name} category`,
        keywords: validation.data.seo?.keywords || [],
      },
      display: validation.data.display || {
        showInMenu: true,
        showInFooter: false,
      },
    };

    const category =
      await categoriesRepository.createWithHierarchy(categoryData);

    return successResponse(category, SUCCESS_MESSAGES.CATEGORY.CREATED, 201);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResponse(error.message, 401);
    }

    if (error instanceof AuthorizationError) {
      return errorResponse(error.message, 403);
    }

    serverLogger.error("POST /api/categories error", { error });
    return errorResponse(ERROR_MESSAGES.CATEGORY.CREATE_FAILED, 500);
  }
}
