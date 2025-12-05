/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/demo/sessions/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

/**
 * Function: G E T
 */
/**
 * Performs g e t operation
 *
 * @returns {Promise<void>} Promise that resolves when operation completes
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * const result = GET();
 */
/**
 * Performs g e t operation
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET();
 */

/**
 * Performs g e t operation
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET();
 */

export async function GET() {
  try {
    const db = getFirestoreAdmin();

    // Get all unique demo sessions
    const categoriesSnapshot = await db
      .collection(COLLECTIONS.CATEGORIES)
      .where("demoSession", "!=", null)
      .select("demoSession", "createdAt")
      .get();

    const sessionsMap = new Map<string, Date>();

    categoriesSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.demoSession && !sessionsMap.has(data.demoSession)) {
        sessionsMap.set(
          data.demoSession,
          data.createdAt?.toDate() || new Date(),
        );
      }
    });

    const sessions = Array.from(sessionsMap.entries()).map(
      ([sessionId, createdAt]) => ({
        sessionId,
        /** Created At */
        createdAt: createdAt.toISOString(),
      }),
    );

    // Sort by newest first
    sessions.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error("Sessions fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
