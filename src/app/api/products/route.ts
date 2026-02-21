/**
 * Products API Routes
 *
 * Handles product listing and creation.
 * Listing uses Firestore-native Sieve queries (offset + limit) via
 * productRepository.list() — no full collection scan.
 *
 * TODO (Future):
 * - Full-text search via Algolia/Typesense
 * - Response-level metrics tracking (response time, error rate)
 */

import { NextRequest } from "next/server";
import { productRepository } from "@/repositories";
import { ERROR_MESSAGES, SUCCESS_MESSAGES, UI_LABELS } from "@/constants";
import { slugify } from "@/utils";
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
import { sendNewProductSubmittedEmail } from "@/lib/email";
import { SCHEMA_DEFAULTS } from "@/db/schema";
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

    // Firestore-native query — no full collection scan
    const sieveResult = await productRepository.list({
      filters,
      sorts,
      page,
      pageSize,
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
 * ✅ Generates SEO-friendly slug from title (e.g. "vintage-camera-1700000000000")
 * ✅ Sends fire-and-forget admin notification email on successful submission
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

    // Create product with seller ID, defaults, and SEO slug
    const slug = `${slugify(validation.data.title).slice(0, 50)}-${Date.now()}`;
    const product = await productRepository.create({
      ...validation.data,
      slug,
      sellerId: user.uid,
      sellerName: user.displayName || user.email || "Unknown Seller",
      sellerEmail: user.email || "",
      status: "draft" as any,
      featured: false,
      isPromoted: false,
    } as any);

    // Fire-and-forget admin notification — do not await to keep response fast
    const adminEmail =
      process.env.ADMIN_NOTIFICATION_EMAIL || SCHEMA_DEFAULTS.ADMIN_EMAIL;
    sendNewProductSubmittedEmail(adminEmail, {
      id: product.id ?? (product as any).id,
      title: (product as any).title ?? validation.data.title,
      sellerName: user.displayName || user.email || "Unknown Seller",
      sellerEmail: user.email || "",
      category: validation.data.category,
    }).catch((err) =>
      serverLogger.error(ERROR_MESSAGES.API.PRODUCTS_POST_ERROR, { err }),
    );

    return successResponse(product, SUCCESS_MESSAGES.PRODUCT.CREATED, 201);
  } catch (error) {
    serverLogger.error(ERROR_MESSAGES.API.PRODUCTS_POST_ERROR, { error });
    return handleApiError(error);
  }
}
