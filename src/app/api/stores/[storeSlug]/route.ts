import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse } from "@/lib/api-response";
import { NotFoundError } from "@/lib/errors";
import { ERROR_MESSAGES } from "@/constants";
import { storeRepository } from "@/repositories";
import { createApiHandler } from "@/lib/api/api-handler";
import { RateLimitPresets } from "@/lib/security/rate-limit";

/**
 * GET /api/stores/[storeSlug]
 * Public endpoint — returns a single store's public profile by storeSlug.
 */
export const GET = createApiHandler<never, { storeSlug: string }>({
  rateLimit: RateLimitPresets.API,
  handler: async ({ params }) => {
    const { storeSlug } = params!;

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
  },
});
