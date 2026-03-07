import { NextRequest } from "next/server";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse } from "@/lib/api-response";
import { ValidationError, NotFoundError } from "@/lib/errors";
import { ERROR_MESSAGES } from "@/constants";
import { storeRepository } from "@/repositories";

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

    const storeDoc = await storeRepository.findBySlug(storeSlug);

    if (!storeDoc || storeDoc.status !== "active" || !storeDoc.isPublic) {
      throw new NotFoundError(ERROR_MESSAGES.USER.NOT_FOUND);
    }

    const store = {
      id: storeDoc.id,
      storeSlug: storeDoc.storeSlug,
      ownerId: storeDoc.ownerId,
      storeName: storeDoc.storeName,
      storeDescription: storeDoc.storeDescription,
      storeCategory: storeDoc.storeCategory,
      storeLogoURL: storeDoc.storeLogoURL,
      storeBannerURL: storeDoc.storeBannerURL,
      bio: storeDoc.bio,
      location: storeDoc.location,
      website: storeDoc.website,
      socialLinks: storeDoc.socialLinks,
      returnPolicy: storeDoc.returnPolicy,
      shippingPolicy: storeDoc.shippingPolicy,
      isVacationMode: storeDoc.isVacationMode,
      vacationMessage: storeDoc.vacationMessage,
      status: storeDoc.status,
      isPublic: storeDoc.isPublic,
      totalProducts: storeDoc.stats?.totalProducts ?? 0,
      itemsSold: storeDoc.stats?.itemsSold ?? 0,
      totalReviews: storeDoc.stats?.totalReviews ?? 0,
      averageRating: storeDoc.stats?.averageRating,
      createdAt: storeDoc.createdAt,
    };

    return successResponse({ store });
  } catch (error) {
    return handleApiError(error);
  }
}
