/**
 * @fileoverview TypeScript Module
 * @module src/app/api/shops/[slug]/follow/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS, SUBCOLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/shops/[slug]/follow - Follow a shop
 * DELETE /api/shops/[slug]/follow - Unfollow a shop
 */

// Helper to get current user (temporary - replace with actual auth)
/**
 * Retrieves current user
 */
/**
 * Retrieves current user
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to currentuser result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

/**
 * Retrieves current user
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to currentuser result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

async function getCurrentUser(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return null;

  const db = getFirestoreAdmin();
  const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();
  if (!userDoc.exists) return null;

  return { id: userDoc.id, ...userDoc.data() };
}

// POST - Follow shop
/**
 * Function: P O S T
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request, {});
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(/** Request */
  request, {});
 */

export async function POST(
  /** Request */
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const db = getFirestoreAdmin();

    // Get shop by slug
    const shopsSnapshot = await db
      .collection(COLLECTIONS.SHOPS)
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (shopsSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Shop not found" },
        { status: 404 },
      );
    }

    const shopDoc = shopsSnapshot.docs[0];
    const shopId = shopDoc.id;

    // Check if already following
    const followDoc = await db
      .collection(COLLECTIONS.USERS)
      .doc(user.id)
      .collection(SUBCOLLECTIONS.SHOP_FOLLOWING)
      .doc(shopId)
      .get();

    if (followDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Already following this shop" },
        { status: 400 },
      );
    }

    // Add to user's following
    await db
      .collection(COLLECTIONS.USERS)
      .doc(user.id)
      .collection(SUBCOLLECTIONS.SHOP_FOLLOWING)
      .doc(shopId)
      .set({
        shop_id: shopId,
        shop_slug: slug,
        followed_at: new Date().toISOString(),
      });

    // Increment shop's follower count
    await db
      .collection(COLLECTIONS.SHOPS)
      .doc(shopId)
      .update({
        follower_count: (shopDoc.data()?.follower_count || 0) + 1,
      });

    return NextResponse.json({
      /** Success */
      success: true,
      /** Message */
      message: "Shop followed successfully",
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "API.shops.follow.POST",
      /** Metadata */
      metadata: { slug: await params.then((p) => p.slug) },
    });
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE - Unfollow shop
/**
 * Function: D E L E T E
 */
/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to delete result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * DELETE(request, {});
 */

/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to delete result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * DELETE(/** Request */
  request, {});
 */

export async function DELETE(
  /** Request */
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const db = getFirestoreAdmin();

    // Get shop by slug
    const shopsSnapshot = await db
      .collection(COLLECTIONS.SHOPS)
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (shopsSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Shop not found" },
        { status: 404 },
      );
    }

    const shopDoc = shopsSnapshot.docs[0];
    const shopId = shopDoc.id;

    // Check if following
    const followDoc = await db
      .collection(COLLECTIONS.USERS)
      .doc(user.id)
      .collection(SUBCOLLECTIONS.SHOP_FOLLOWING)
      .doc(shopId)
      .get();

    if (!followDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Not following this shop" },
        { status: 400 },
      );
    }

    // Remove from user's following
    await db
      .collection(COLLECTIONS.USERS)
      .doc(user.id)
      .collection(SUBCOLLECTIONS.SHOP_FOLLOWING)
      .doc(shopId)
      .delete();

    // Decrement shop's follower count
    const currentCount = shopDoc.data()?.follower_count || 0;
    await db
      .collection(COLLECTIONS.SHOPS)
      .doc(shopId)
      .update({
        follower_count: Math.max(0, currentCount - 1),
      });

    return NextResponse.json({
      /** Success */
      success: true,
      /** Message */
      message: "Shop unfollowed successfully",
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "API.shops.follow.DELETE",
      /** Metadata */
      metadata: { slug: await params.then((p) => p.slug) },
    });
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// GET - Check if following
/**
 * Function: G E T
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request, {});
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(/** Request */
  request, {});
 */

export async function GET(
  /** Request */
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ isFollowing: false });
    }

    const db = getFirestoreAdmin();

    // Get shop by slug
    const shopsSnapshot = await db
      .collection(COLLECTIONS.SHOPS)
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (shopsSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Shop not found" },
        { status: 404 },
      );
    }

    const shopId = shopsSnapshot.docs[0].id;

    // Check if following
    const followDoc = await db
      .collection(COLLECTIONS.USERS)
      .doc(user.id)
      .collection(SUBCOLLECTIONS.SHOP_FOLLOWING)
      .doc(shopId)
      .get();

    return NextResponse.json({ isFollowing: followDoc.exists });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "API.shops.follow.GET",
      /** Metadata */
      metadata: { slug: await params.then((p) => p.slug) },
    });
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
