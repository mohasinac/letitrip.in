/**
 * Products API Routes
 *
 * Handles product listing and creation
 *
 * TODO - Phase 2 Refactoring:
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

import { NextRequest, NextResponse } from "next/server";
import { productRepository } from "@/repositories";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { requireRoleFromRequest } from "@/lib/security/authorization";
import {
  validateRequestBody,
  formatZodErrors,
  productCreateSchema,
} from "@/lib/validation/schemas";
import { AuthenticationError, AuthorizationError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";

/**
 * GET /api/products
 *
 * Get list of products with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const category = searchParams.get("category") || undefined;
    const subcategory = searchParams.get("subcategory") || undefined;
    const status = searchParams.get("status") || undefined;
    const sellerId = searchParams.get("sellerId") || undefined;
    const featured = searchParams.get("featured") === "true" ? true : undefined;
    const isAuction =
      searchParams.get("isAuction") === "true" ? true : undefined;
    const isPromoted =
      searchParams.get("isPromoted") === "true" ? true : undefined;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

    // Get all products from repository
    const allProducts = await productRepository.findAll();

    // Apply filters manually
    let filtered = allProducts;
    if (category) filtered = filtered.filter((p) => p.category === category);
    if (subcategory)
      filtered = filtered.filter((p) => p.subcategory === subcategory);
    if (status) filtered = filtered.filter((p) => p.status === status);
    if (sellerId) filtered = filtered.filter((p) => p.sellerId === sellerId);
    if (featured !== undefined)
      filtered = filtered.filter((p) => p.featured === featured);
    if (isAuction !== undefined)
      filtered = filtered.filter((p) => p.isAuction === isAuction);
    if (isPromoted !== undefined)
      filtered = filtered.filter((p) => p.isPromoted === isPromoted);

    // Apply sorting
    filtered.sort((a: any, b: any) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (sortOrder === "asc") return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

    // Get total count for pagination
    const total = filtered.length;

    // Apply pagination
    const offset = (page - 1) * limit;
    const products = filtered.slice(offset, offset + limit);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return NextResponse.json(
      {
        success: true,
        data: products,
        meta: {
          page,
          limit,
          total,
          totalPages,
          hasMore,
        },
      },
      {
        headers: {
          "Cache-Control":
            "public, max-age=60, s-maxage=120, stale-while-revalidate=60",
        },
      },
    );
  } catch (error) {
    // TODO: Use handleApiError from error handler
    serverLogger.error(ERROR_MESSAGES.API.PRODUCTS_GET_ERROR, { error });
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.PRODUCT.FETCH_FAILED },
      { status: 500 },
    );
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
 * TODO: Implement product creation
 * TODO: Add authentication requirement (sellers only)
 * TODO: Validate request body with Zod schema
 * TODO: Handle image uploads (if not pre-uploaded)
 * TODO: Generate SEO-friendly product ID
 * TODO: Send notification to admins for approval
 * TODO: Return created product with ID
 */
export async function POST(request: NextRequest) {
  try {
    // Require seller authentication
    const user = await requireRoleFromRequest(request, [
      "seller",
      "moderator",
      "admin",
    ]);

    // Parse and validate body
    const body = await request.json();
    const validation = validateRequestBody(productCreateSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: ERROR_MESSAGES.VALIDATION.FAILED,
          fields: formatZodErrors(validation.errors),
        },
        { status: 400 },
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

    return NextResponse.json(
      {
        success: true,
        data: product,
        message: SUCCESS_MESSAGES.PRODUCT.CREATED,
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof AuthenticationError ||
      error instanceof AuthorizationError
    ) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error instanceof AuthenticationError ? 401 : 403 },
      );
    }

    serverLogger.error(ERROR_MESSAGES.API.PRODUCTS_POST_ERROR, { error });
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.PRODUCT.CREATE_FAILED },
      { status: 500 },
    );
  }
}
