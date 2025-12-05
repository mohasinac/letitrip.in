/**
 * @fileoverview TypeScript Module
 * @module src/app/api/notifications/unread-count/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Notifications Unread Count API
 * Epic: E033 - Live Header Data
 *
 * GET /api/notifications/unread-count - Get unread notification count
 */

import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/notifications/unread-count
 * Returns the count of unread notifications
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request);
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request);
 */

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);

    if (!auth.user) {
      return NextResponse.json({
        /** Success */
        success: true,
        /** Data */
        data: { count: 0 },
      });
    }

    const db = getFirestoreAdmin();
    const countSnapshot = await db
      .collection(COLLECTIONS.NOTIFICATIONS)
      .where("user_id", "==", auth.user.uid)
      .where("read", "==", false)
      .count()
      .get();

    const count = countSnapshot.data().count || 0;

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: { count },
    });
  } catch (error) {
    console.error("Error getting notification count:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get notification count" },
      { status: 500 },
    );
  }
}
