import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { getAdminApp } from "@/lib/firebase/admin";
import { USER_COLLECTION } from "@/db/schema/users";
import type { UserDocument } from "@/db/schema/users";
import { handleApiError } from "@/lib/errors";
import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
} from "@/lib/errors";
import { ERROR_MESSAGES } from "@/constants";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await context.params;

    if (!userId) {
      throw new ValidationError(ERROR_MESSAGES.GENERIC.USER_ID_REQUIRED);
    }

    // Get Firestore instance
    const db = getFirestore(getAdminApp());

    // Fetch user document
    const userDoc = await db.collection(USER_COLLECTION).doc(userId).get();

    if (!userDoc.exists) {
      throw new NotFoundError(ERROR_MESSAGES.USER.NOT_FOUND);
    }

    const userData = userDoc.data() as UserDocument;

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

    return NextResponse.json(
      {
        success: true,
        user: publicProfile,
      },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
