/**
 * @fileoverview TypeScript Module
 * @module src/app/api/favorites/[type]/[id]/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "@/app/api/lib/session";

const VALID_TYPES = ["product", "shop", "category", "auction"];

// POST /api/favorites/[type]/[id] - Add to favorites
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
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, id } = await params;

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const key = `${user.id}_${type}_${id}`;
    const doc = await Collections.favorites().doc(key).get();

    if (doc.exists) {
      return NextResponse.json(
        { error: "Already in favorites" },
        { status: 400 },
      );
    }

    await Collections.favorites().doc(key).set({
      user_id: user.id,
      item_id: id,
      item_type: type,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      /** Success */
      success: true,
      /** Message */
      message: "Added to favorites",
    });
  } catch (error) {
    console.error("Add to favorites error:", error);
    return NextResponse.json(
      { error: "Failed to add to favorites" },
      { status: 500 },
    );
  }
}

// DELETE /api/favorites/[type]/[id] - Remove from favorites
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
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, id } = await params;

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const key = `${user.id}_${type}_${id}`;
    const doc = await Collections.favorites().doc(key).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Not in favorites" }, { status: 404 });
    }

    await Collections.favorites().doc(key).delete();

    return NextResponse.json({
      /** Success */
      success: true,
      /** Message */
      message: "Removed from favorites",
    });
  } catch (error) {
    console.error("Remove from favorites error:", error);
    return NextResponse.json(
      { error: "Failed to remove from favorites" },
      { status: 500 },
    );
  }
}

// GET /api/favorites/[type]/[id] - Check if in favorites
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
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.id) {
      return NextResponse.json({ isFavorite: false });
    }

    const { type, id } = await params;

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const key = `${user.id}_${type}_${id}`;
    const doc = await Collections.favorites().doc(key).get();

    return NextResponse.json({
      /** Is Favorite */
      isFavorite: doc.exists,
    });
  } catch (error) {
    console.error("Check favorite error:", error);
    return NextResponse.json({ isFavorite: false });
  }
}
