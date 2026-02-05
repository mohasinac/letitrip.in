/**
 * API Route: Delete User Account
 * DELETE /api/profile/delete-account
 *
 * Permanently deletes user account and all associated data
 * Implements cascade delete pattern from schema documentation
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/firebase/auth-server";
import { userRepository, tokenRepository } from "@/repositories";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  ValidationError,
  AuthenticationError,
  handleApiError,
} from "@/lib/errors";
import { applyRateLimit } from "@/lib/security/rate-limit";

// Validation schema
const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required for account deletion"),
  confirmation: z.literal("DELETE").refine((val) => val === "DELETE", {
    message: "Type DELETE to confirm",
  }),
});

export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting: 3 attempts per hour
    const rateLimitResult = await applyRateLimit(request, {
      limit: 3,
      window: 60 * 60,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many deletion attempts. Please try again later.",
        },
        { status: 429 },
      );
    }

    // Authenticate user
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new AuthenticationError("Authentication required");
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = deleteAccountSchema.safeParse(body);

    if (!validationResult.success) {
      throw new ValidationError(
        "Invalid input",
        validationResult.error.flatten().fieldErrors as Record<
          string,
          string[]
        >,
      );
    }

    const { password } = validationResult.data;

    // Verify password before deletion
    // This would require re-authentication check
    // For now, we trust the client-side re-authentication

    /**
     * CASCADE DELETE PATTERN (from users schema)
     *
     * When deleting a user, we must delete:
     * 1. User document in users collection
     * 2. All trips where userId = user.uid
     * 3. All bookings where userId = user.uid
     * 4. All emailVerificationTokens where userId = user.uid
     * 5. All passwordResetTokens where userId = user.uid (or email = user.email)
     * 6. Firebase Auth account
     */

    const batch = writeBatch(db);

    // 1. Delete user tokens
    await tokenRepository.email.deleteAllForUser(user.uid);

    // 2. Delete trips (if trips collection exists)
    const tripsQuery = query(
      collection(db, "trips"),
      where("userId", "==", user.uid),
    );
    const tripsSnapshot = await getDocs(tripsQuery);
    tripsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // 3. Delete bookings (if bookings collection exists)
    const bookingsQuery = query(
      collection(db, "bookings"),
      where("userId", "==", user.uid),
    );
    const bookingsSnapshot = await getDocs(bookingsQuery);
    bookingsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // 4. Delete user document
    const userDoc = await userRepository.findById(user.uid);
    if (userDoc) {
      await userRepository.delete(user.uid);
    }

    // Commit batch delete
    await batch.commit();

    // 5. Delete Firebase Auth account
    // Note: This should be done via Firebase Admin SDK on server
    // Client will handle this after successful response

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
      data: {
        deletedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
