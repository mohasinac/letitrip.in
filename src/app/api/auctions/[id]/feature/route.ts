/**
 * @fileoverview TypeScript Module
 * @module src/app/api/auctions/[id]/feature/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "../../../lib/session";

// PATCH /api/auctions/[id]/feature - admin only
/**
 * Function: P A T C H
 */
/**
 * Performs p a t c h operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to patch result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PATCH(request, {});
 */

/**
 * Performs p a t c h operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to patch result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PATCH(/** Request */
  request, {});
 */

/**
 * Performs p a t c h operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params: Promise<{ id: string }> }} { params } - The { params }
 *
 * @returns {Promise<any>} The patch result
 *
 * @example
 * PATCH(request, {});
 */
export async function PATCH(
  /** Request */
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser(request);
    if (user?.role !== "admin")
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    const { id } = await params;
    const body = await request.json();
    const update: any = {
      is_featured: !!body.featured,
      featured_priority: body.featuredPriority ?? 0,
      updated_at: new Date().toISOString(),
    };
    await Collections.auctions().doc(id).update(update);
    const updated = await Collections.auctions().doc(id).get();
    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: { id: updated.id, ...updated.data() },
    });
  } catch (error) {
    console.error("Feature auction error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update feature flag" },
      { status: 500 },
    );
  }
}
