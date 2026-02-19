/**
 * User Wishlist API — Single Item
 *
 * GET    /api/user/wishlist/[productId] — Check if product is in wishlist
 * DELETE /api/user/wishlist/[productId] — Remove product from wishlist
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/firebase/auth-server";
import { wishlistRepository } from "@/repositories";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";

/**
 * GET /api/user/wishlist/[productId]
 * Returns { inWishlist: boolean }
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ productId: string }> },
) {
  try {
    const user = await requireAuth();
    const { productId } = await context.params;

    const inWishlist = await wishlistRepository.isInWishlist(
      user.uid,
      productId,
    );

    return successResponse({ inWishlist, productId });
  } catch (error) {
    serverLogger.error("GET /api/user/wishlist/[productId] error", { error });
    return handleApiError(error);
  }
}

/**
 * DELETE /api/user/wishlist/[productId]
 */
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ productId: string }> },
) {
  try {
    const user = await requireAuth();
    const { productId } = await context.params;

    const inWishlist = await wishlistRepository.isInWishlist(
      user.uid,
      productId,
    );
    if (!inWishlist) {
      return errorResponse(ERROR_MESSAGES.WISHLIST.NOT_FOUND, 404);
    }

    await wishlistRepository.removeItem(user.uid, productId);

    return successResponse({ productId }, SUCCESS_MESSAGES.WISHLIST.REMOVED);
  } catch (error) {
    serverLogger.error("DELETE /api/user/wishlist/[productId] error", {
      error,
    });
    return handleApiError(error);
  }
}
