/**
 * User Wishlist API — Collection
 *
 * GET  /api/user/wishlist — List current user's wishlist items (with product details)
 * POST /api/user/wishlist — Add a product to the wishlist
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/firebase/auth-server";
import { wishlistRepository } from "@/repositories";
import { productRepository } from "@/repositories";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import { z } from "zod";

const addSchema = z.object({
  productId: z.string().min(1),
});

/**
 * GET /api/user/wishlist
 *
 * Returns wishlist items with product details for the authenticated user.
 */
export async function GET() {
  try {
    const user = await requireAuth();

    const items = await wishlistRepository.getWishlistItems(user.uid);

    // Fetch product details for each wishlist item
    const productResults = await Promise.allSettled(
      items.map((item) => productRepository.findById(item.productId)),
    );

    const enriched = items
      .map((item, i) => {
        const result = productResults[i];
        const product = result.status === "fulfilled" ? result.value : null;
        return { ...item, product };
      })
      .filter((item) => item.product !== null);

    return successResponse({
      items: enriched,
      meta: { total: enriched.length },
    });
  } catch (error) {
    serverLogger.error("GET /api/user/wishlist error", { error });
    return handleApiError(error);
  }
}

/**
 * POST /api/user/wishlist
 *
 * Body: { productId: string }
 * Adds a product to the user's wishlist (idempotent).
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const validation = addSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(ERROR_MESSAGES.VALIDATION.FAILED, 400);
    }

    const { productId } = validation.data;

    // Verify product exists
    const product = await productRepository.findById(productId);
    if (!product) {
      return errorResponse(ERROR_MESSAGES.PRODUCT.NOT_FOUND, 404);
    }

    await wishlistRepository.addItem(user.uid, productId);

    return successResponse({ productId }, SUCCESS_MESSAGES.WISHLIST.ADDED, 201);
  } catch (error) {
    serverLogger.error("POST /api/user/wishlist error", { error });
    return handleApiError(error);
  }
}
