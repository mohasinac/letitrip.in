/**
 * Products API Routes
 *
 * Handles product listing and creation
 *
 * TODO (Future) - Phase 2:
 * - Implement pagination with cursor-based or offset pagination
 * - Add filtering by category, price range, status, seller
 * - Add sorting options (price, date, popularity)
 * - Add search functionality with Algolia/Typesense integration
 * - Implement caching strategy for product listings
 * - Add rate limiting per user/IP
 * - Add request validation with Zod schemas
 * - Implement proper error handling with error classes
 * - Add logging for all operations
 * - Add metrics tracking (response time, error rate)
 */

import { NextRequest } from "next/server";
import { productRepository } from "@/repositories";
import { ERROR_MESSAGES, SUCCESS_MESSAGES, UI_LABELS } from "@/constants";
import { applySieveToArray } from "@/helpers";
import { errorResponse, successResponse } from "@/lib/api-response";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@/lib/api/request-helpers";
import {
  requireRoleFromRequest,
  requireEmailVerified,
} from "@/lib/security/authorization";
import { applyRateLimit, RateLimitPresets } from "@/lib/security/rate-limit";
import {
  validateRequestBody,
  formatZodErrors,
  productCreateSchema,
} from "@/lib/validation/schemas";
import { serverLogger } from "@/lib/server-logger";
import { handleApiError } from "@/lib/errors/error-handler";
import { NextResponse } from "next/server";

/**
 * GET /api/products
 *
 * Get list of products with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting — prevent scraping
    const rateLimitResult = await applyRateLimit(
      request,
      RateLimitPresets.GENEROUS,
    );
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: UI_LABELS.AUTH.RATE_LIMIT_EXCEEDED },
        { status: 429 },
      );
    }

    // Parse query parameters
    const searchParams = getSearchParams(request);
    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 20, {
      min: 1,
      max: 100,
    });
    const filters = getStringParam(searchParams, "filters");
    const sorts = getStringParam(searchParams, "sorts") || "-createdAt";

    // Get all products from repository
    const allProducts = await productRepository.findAll();

    const sieveResult = await applySieveToArray({
      items: allProducts,
      model: {
        filters,
        sorts,
        page,
        pageSize,
      },
      fields: {
        id: { canFilter: true, canSort: false },
        title: { canFilter: true, canSort: true },
        category: { canFilter: true, canSort: true },
        subcategory: { canFilter: true, canSort: true },
        status: { canFilter: true, canSort: true },
        sellerId: { canFilter: true, canSort: false },
        featured: {
          canFilter: true,
          canSort: false,
          parseValue: (value: string) => value === "true",
        },
        isAuction: {
          canFilter: true,
          canSort: false,
          parseValue: (value: string) => value === "true",
        },
        isPromoted: {
          canFilter: true,
          canSort: false,
          parseValue: (value: string) => value === "true",
        },
        price: {
          canFilter: true,
          canSort: true,
          parseValue: (value: string) => Number(value),
        },
        createdAt: {
          canFilter: true,
          canSort: true,
          parseValue: (value: string) => new Date(value),
        },
      },
      options: {
        defaultPageSize: 20,
        maxPageSize: 100,
        throwExceptions: false,
      },
    });

    const response = NextResponse.json(
      {
        success: true,
        data: sieveResult.items,
        meta: {
          page: sieveResult.page,
          limit: sieveResult.pageSize,
          total: sieveResult.total,
          totalPages: sieveResult.totalPages,
          hasMore: sieveResult.hasMore,
        },
      },
      { status: 200 },
    );
    response.headers.set(
      "Cache-Control",
      "public, max-age=60, s-maxage=120, stale-while-revalidate=60",
    );
    return response;
  } catch (error) {
    serverLogger.error(ERROR_MESSAGES.API.PRODUCTS_GET_ERROR, { error });
    return handleApiError(error);
  }
}

/**
 * POST /api/products
 *
 * Create a new product
 *
 * Body:
 * - title: string (required)
 * - description: string (required)
 * - category: string (required)
 * - price: number (required)
 * - stockQuantity: number (required)
 * - mainImage: string (required, 1:1 aspect ratio)
 * - images: string[] (optional, max 10)
 * - video: object (optional)
 * - ... (see ProductDocument interface)
 *
 * Ã¢Å“â€¦ Requires seller/moderator/admin authentication via requireRoleFromRequest * Ã¢Å„â¦ Requires verified email for sellers (403 EMAIL_NOT_VERIFIED if unverified) * Ã¢Å“â€¦ Validates body with productCreateSchema (Zod)
 * Ã¢Å“â€¦ Creates product via productRepository.create() with status='draft'
 * Ã¢Å“â€¦ Returns created product with 201 status
 * NOTE: Images are pre-uploaded via /api/media/upload before product creation
 * TODO (Future): Generate SEO-friendly slug/ID for product URLs
 * TODO (Future): Send notification to admins when new product submitted for approval
 */
export async function POST(request: NextRequest) {
  try {
    // Require seller authentication
    const user = await requireRoleFromRequest(request, [
      "seller",
      "moderator",
      "admin",
    ]);

    // Sellers must verify their email before listing products
    requireEmailVerified(user as unknown as Record<string, unknown>);

    // Parse and validate body
    const body = await request.json();
    const validation = validateRequestBody(productCreateSchema, body);

    if (!validation.success) {
      return errorResponse(
        ERROR_MESSAGES.VALIDATION.FAILED,
        400,
        formatZodErrors(validation.errors),
      );
    }

    // Create product with seller ID and defaults
    const product = await productRepository.create({
      ...validation.data,
      sellerId: user.uid,
      sellerName: user.displayName || user.email || "Unknown Seller",
      sellerEmail: user.email || "",
      status: "draft" as any,
      featured: false,
      isPromoted: false,
    } as any);

    return successResponse(product, SUCCESS_MESSAGES.PRODUCT.CREATED, 201);
  } catch (error) {
    serverLogger.error(ERROR_MESSAGES.API.PRODUCTS_POST_ERROR, { error });
    return handleApiError(error);
  }
}
