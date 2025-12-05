/**
 * @fileoverview TypeScript Module
 * @module src/app/api/reviews/[id]/helpful/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { getCurrentUser } from "@/app/api/lib/session";
import { COLLECTIONS, SUBCOLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

// POST /api/reviews/[id]/helpful - Mark review as helpful
/**
 * Function: P O S T
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} req - The req
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(req, {});
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} /** Req */
  req - The /**  req */
  req
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(/** Req */
  req, {});
 */

export async function POST(
  /** Req */
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let id: string | undefined;
  try {
    const db = getFirestoreAdmin();
    const awaitedParams = await params;
    id = awaitedParams.id;

    // Get user from session
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 },
      );
    }
    const userId = user.id;

    // Check if review exists
    const doc = await db.collection(COLLECTIONS.REVIEWS).doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Check if user already marked as helpful (using subcollection)
    const helpfulDoc = await db
      .collection(COLLECTIONS.REVIEWS)
      .doc(id)
      .collection(SUBCOLLECTIONS.REVIEW_HELPFUL_VOTES)
      .doc(userId)
      .get();

    if (helpfulDoc.exists) {
      return NextResponse.json(
        { error: "You have already marked this review as helpful" },
        { status: 400 },
      );
    }

    // Add helpful vote
    await db
      .collection(COLLECTIONS.REVIEWS)
      .doc(id)
      .collection(SUBCOLLECTIONS.REVIEW_HELPFUL_VOTES)
      .doc(userId)
      .set({
        user_id: userId,
        created_at: new Date().toISOString(),
      });

    // Increment helpful count
    await db
      .collection(COLLECTIONS.REVIEWS)
      .doc(id)
      .update({
        helpful_count: (doc.data()?.helpful_count || 0) + 1,
      });

    return NextResponse.json({
      /** Message */
      message: "Review marked as helpful",
      helpful_count: (doc.data()?.helpful_count || 0) + 1,
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "API.reviews.id.helpful.POST",
      /** Metadata */
      metadata: { reviewId: id },
    });
    return NextResponse.json(
      { error: "Failed to mark review as helpful" },
      { status: 500 },
    );
  }
}
