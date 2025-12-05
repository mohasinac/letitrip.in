/**
 * @fileoverview TypeScript Module
 * @module src/app/api/reviews/[id]/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * Individual Review Operations with RBAC
 * GET: Retrieve review (public if approved, owner/admin all)
 * PATCH: Update review (owner/admin only)
 * DELETE: Delete review (owner/admin only)
 */

// GET /api/reviews/[id] - Get review details
/**
 * Function: G E T
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} req - The req
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(req, {});
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} /** Req */
  req - The /**  req */
  req
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(/** Req */
  req, {});
 */

export async function GET(
  /** Req */
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let id: string | undefined;
  try {
    const db = getFirestoreAdmin();
    const user = await getUserFromRequest(req);
    const awaitedParams = await params;
    id = awaitedParams.id;

    const doc = await db.collection(COLLECTIONS.REVIEWS).doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 },
      );
    }

    const review: any = doc.data();

    // Access control: public can only see published reviews
    if (!user || user.role !== "admin") {
      if (review.status !== "published") {
        // Owner can see their own unpublished reviews
        if (!user || review.user_id !== user.uid) {
          return NextResponse.json(
            { success: false, error: "Review not found" },
            { status: 404 },
          );
        }
      }
    }
    // Admin can see all reviews

    return NextResponse.json({
      /** Success */
      success: true,
      /** Review */
      review: {
        /** Id */
        id: doc.id,
        ...review,
      },
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "API.reviews.id.GET",
      /** Metadata */
      metadata: { reviewId: id },
    });
    return NextResponse.json(
      { success: false, error: "Failed to fetch review" },
      { status: 500 },
    );
  }
}

// PATCH /api/reviews/[id] - Update review
/**
 * Function: P A T C H
 */
/**
 * Performs p a t c h operation
 *
 * @param {NextRequest} req - The req
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to patch result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PATCH(req, {});
 */

/**
 * Performs p a t c h operation
 *
 * @param {NextRequest} /** Req */
  req - The /**  req */
  req
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to patch result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PATCH(/** Req */
  req, {});
 */

export async function PATCH(
  /** Req */
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let id: string | undefined;
  try {
    const authResult = await requireAuth(req);
    if (authResult.error) return authResult.error;

    const { user } = authResult;
    const db = getFirestoreAdmin();
    const awaitedParams = await params;
    id = awaitedParams.id;
    const body = await req.json();

    // Check if review exists
    const doc = await db.collection(COLLECTIONS.REVIEWS).doc(id).get();
    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 },
      );
    }

    const review = doc.data();
    const isOwner = review?.user_id === user.uid;
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "You can only edit your own reviews" },
        { status: 403 },
      );
    }

    // Allowed fields to update
    const allowedUpdates = isAdmin
      ? ["rating", "title", "comment", "images", "status", "is_flagged"]
      : ["rating", "title", "comment", "images"];

    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    allowedUpdates.forEach((field) => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });

    // Validate rating if provided
    if (updates.rating && (updates.rating < 1 || updates.rating > 5)) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 },
      );
    }

    await db.collection(COLLECTIONS.REVIEWS).doc(id).update(updates);

    const updatedDoc = await db.collection(COLLECTIONS.REVIEWS).doc(id).get();

    return NextResponse.json({
      /** Success */
      success: true,
      /** Review */
      review: {
        /** Id */
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
      /** Message */
      message: "Review updated successfully",
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "API.reviews.id.PATCH",
      /** Metadata */
      metadata: { reviewId: id },
    });
    return NextResponse.json(
      { success: false, error: "Failed to update review" },
      { status: 500 },
    );
  }
}

// DELETE /api/reviews/[id] - Delete review
/**
 * Function: D E L E T E
 */
/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} req - The req
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to delete result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * DELETE(req, {});
 */

/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} /** Req */
  req - The /**  req */
  req
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to delete result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * DELETE(/** Req */
  req, {});
 */

export async function DELETE(
  /** Req */
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let id: string | undefined;
  try {
    const authResult = await requireAuth(req);
    if (authResult.error) return authResult.error;

    const { user } = authResult;
    const db = getFirestoreAdmin();
    const awaitedParams = await params;
    id = awaitedParams.id;

    // Check if review exists
    const doc = await db.collection(COLLECTIONS.REVIEWS).doc(id).get();
    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 },
      );
    }

    const review = doc.data();
    const isOwner = review?.user_id === user.uid;
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "You can only delete your own reviews" },
        { status: 403 },
      );
    }

    await db.collection(COLLECTIONS.REVIEWS).doc(id).delete();

    return NextResponse.json({
      /** Success */
      success: true,
      /** Message */
      message: "Review deleted successfully",
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "API.reviews.id.DELETE",
      /** Metadata */
      metadata: { reviewId: id },
    });
    return NextResponse.json(
      { success: false, error: "Failed to delete review" },
      { status: 500 },
    );
  }
}
