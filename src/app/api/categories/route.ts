/**
 * Categories API Routes
 *
 * Handles category hierarchy management
 *
 * TODO - Phase 2 Refactoring:
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
import { requireRoleFromRequest } from "@/lib/security/authorization";
import {
  validateRequestBody,
  formatZodErrors,
  categoryCreateSchema,
} from "@/lib/validation/schemas";
import { AuthenticationError, AuthorizationError } from "@/lib/errors";
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
 * TODO - Phase 3:
 * - Add caching with 5-minute TTL
 * - Add pagination for flat lists
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const rootId = searchParams.get("rootId") || undefined;
    const parentId = searchParams.get("parentId");
    const featured = searchParams.get("featured") === "true";
    const flat = searchParams.get("flat") === "true";

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
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.CATEGORY.FETCH_FAILED },
      { status: 500 },
    );
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
 * TODO - Phase 3:
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
      return NextResponse.json(
        {
          success: false,
          error: ERROR_MESSAGES.VALIDATION.FAILED,
          errors: formatZodErrors(validation.errors),
        },
        { status: 400 },
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

    // Return created category
    return NextResponse.json(
      {
        success: true,
        data: category,
        message: SUCCESS_MESSAGES.CATEGORY.CREATED,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 },
      );
    }

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 },
      );
    }

    serverLogger.error("POST /api/categories error", { error });
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.CATEGORY.CREATE_FAILED },
      { status: 500 },
    );
  }
}
