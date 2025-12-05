/**
 * @fileoverview TypeScript Module
 * @module src/app/api/categories/reorder/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "../../lib/session";
import { createBatch } from "@/app/api/lib/firebase/transactions";

// POST /api/categories/reorder { orders: [{id, sortOrder}] }
/**
 * Function: P O S T
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const { orders } = await request.json();
    if (!Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json(
        { success: false, error: "No orders provided" },
        { status: 400 },
      );
    }

    const batch = createBatch();

    for (const { id, sortOrder } of orders) {
      const ref = Collections.categories().doc(id);
      batch.update(ref, {
        sort_order: sortOrder,
        updated_at: new Date().toISOString(),
      });
    }

    await batch.commit();
    return NextResponse.json({
      /** Success */
      success: true,
      /** Message */
      message: "Reordered successfully",
    });
  } catch (error) {
    console.error("Reorder categories error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reorder categories" },
      { status: 500 },
    );
  }
}
