import type { UserDocument } from "@/db/schema";
import { successResponse } from "@/lib/api-response";
import { NotFoundError, AuthorizationError } from "@/lib/errors";
import { ERROR_MESSAGES } from "@/constants";
import { userRepository } from "@/repositories";
import { createApiHandler } from "@/lib/api/api-handler";
import { RateLimitPresets } from "@/lib/security/rate-limit";

export const GET = createApiHandler<never, { userId: string }>({
  rateLimit: RateLimitPresets.API,
  handler: async ({ params }) => {
    const { userId } = params!;

    const userData = await userRepository.findById(userId);
    if (!userData) throw new NotFoundError(ERROR_MESSAGES.USER.NOT_FOUND);
    if (!userData.publicProfile?.isPublic) {
      throw new AuthorizationError(ERROR_MESSAGES.GENERIC.PROFILE_PRIVATE);
    }

    const publicProfile: Partial<UserDocument> = {
      uid: userData.uid,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      avatarMetadata: userData.avatarMetadata,
      role: userData.role,
      createdAt: userData.createdAt,
      publicProfile: userData.publicProfile,
      stats: userData.stats,
    };

    if (userData.publicProfile?.showEmail) publicProfile.email = userData.email;
    if (userData.publicProfile?.showPhone)
      publicProfile.phoneNumber = userData.phoneNumber;

    return successResponse(publicProfile);
  },
});
