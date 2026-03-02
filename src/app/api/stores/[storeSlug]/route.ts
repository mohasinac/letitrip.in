import { NextRequest } from "next/server";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse } from "@/lib/api-response";
import { ValidationError, NotFoundError } from "@/lib/errors";
import { ERROR_MESSAGES } from "@/constants";
import { userRepository } from "@/repositories";
import type { UserDocument } from "@/db/schema";

/**
 * GET /api/stores/[storeSlug]
 * Public endpoint — returns a single store's public profile by storeSlug.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ storeSlug: string }> },
) {
  try {
    const { storeSlug } = await context.params;

    if (!storeSlug) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION.FAILED);
    }

    const user = await userRepository.findByStoreSlug(storeSlug);

    if (!user || (user.role !== "seller" && user.role !== "admin")) {
      throw new NotFoundError(ERROR_MESSAGES.USER.NOT_FOUND);
    }

    // Return public store data only
    const store: Partial<UserDocument> & { storeSlug?: string } = {
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL,
      avatarMetadata: user.avatarMetadata,
      role: user.role,
      createdAt: user.createdAt,
      storeSlug: user.storeSlug,
      publicProfile: user.publicProfile
        ? {
            isPublic: user.publicProfile.isPublic,
            bio: user.publicProfile.bio,
            location: user.publicProfile.location,
            website: user.publicProfile.website,
            socialLinks: user.publicProfile.socialLinks,
            storeName: user.publicProfile.storeName,
            storeDescription: user.publicProfile.storeDescription,
            storeCategory: user.publicProfile.storeCategory,
            storeLogoURL: user.publicProfile.storeLogoURL,
            storeBannerURL: user.publicProfile.storeBannerURL,
            showEmail: user.publicProfile.showEmail,
            showPhone: user.publicProfile.showPhone,
            showOrders: user.publicProfile.showOrders,
            showWishlist: user.publicProfile.showWishlist,
          }
        : undefined,
      stats: user.stats,
    };

    return successResponse({ store });
  } catch (error) {
    return handleApiError(error);
  }
}
