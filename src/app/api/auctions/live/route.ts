/**
 * @fileoverview TypeScript Module
 * @module src/app/api/auctions/live/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";

// GET /api/auctions/live
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
    const now = new Date().toISOString();
    const q = await Collections.auctions()
      .where("status", "==", "active")
      .where("end_time", ">=", now)
      .orderBy("end_time", "asc")
      .limit(50);
    const snap = await (q as any).get();
    const data = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Live auctions error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load live auctions" },
      { status: 500 },
    );
  }
}
