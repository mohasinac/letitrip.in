import { NextRequest } from "next/server";
import type { UserDocument } from "@/db/schema";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse } from "@/lib/api-response";
import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
} from "@/lib/errors";
import { ERROR_MESSAGES } from "@/constants";
import { userRepository } from "@/repositories";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await context.params;

    if (!userId) {
      throw new ValidationError(ERROR_MESSAGES.GENERIC.USER_ID_REQUIRED);
    }

    // Fetch user using repository (Rule 8 — no direct Firestore access)
    const userData = await userRepository.findById(userId);

    if (!userData) {
      throw new NotFoundError(ERROR_MESSAGES.USER.NOT_FOUND);
    }

    // Check if profile is public
    if (!userData.publicProfile?.isPublic) {
      throw new AuthorizationError(ERROR_MESSAGES.GENERIC.PROFILE_PRIVATE);
    }

    // Prepare public profile data
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

    // Conditionally include email and phone based on privacy settings
    if (userData.publicProfile?.showEmail) {
      publicProfile.email = userData.email;
    }

    if (userData.publicProfile?.showPhone) {
      publicProfile.phoneNumber = userData.phoneNumber;
    }

    return successResponse(publicProfile);
  } catch (error) {
    return handleApiError(error);
  }
}
