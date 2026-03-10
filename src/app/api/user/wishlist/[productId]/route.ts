/**
 * User Wishlist API — Single Item
 *
 * GET    /api/user/wishlist/[productId] — Check if product is in wishlist
 * DELETE /api/user/wishlist/[productId] — Remove product from wishlist
 */

import { wishlistRepository } from "@/repositories";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { createApiHandler } from "@/lib/api/api-handler";
import { RateLimitPresets } from "@/lib/security/rate-limit";

export const GET = createApiHandler<never, { productId: string }>({
  auth: true,
  rateLimit: RateLimitPresets.API,
  handler: async ({ user, params }) => {
    const { productId } = params!;
    const inWishlist = await wishlistRepository.isInWishlist(
      user!.uid,
      productId,
    );
    return successResponse({ inWishlist, productId });
  },
});

export const DELETE = createApiHandler<never, { productId: string }>({
  auth: true,
  rateLimit: RateLimitPresets.API,
  handler: async ({ user, params }) => {
    const { productId } = params!;

    const inWishlist = await wishlistRepository.isInWishlist(
      user!.uid,
      productId,
    );
    if (!inWishlist)
      return errorResponse(ERROR_MESSAGES.WISHLIST.NOT_FOUND, 404);

    await wishlistRepository.removeItem(user!.uid, productId);
    return successResponse({ productId }, SUCCESS_MESSAGES.WISHLIST.REMOVED);
  },
});
