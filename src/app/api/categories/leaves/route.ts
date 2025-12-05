/**
 * @fileoverview TypeScript Module
 * @module src/app/api/categories/leaves/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";

// GET /api/categories/leaves - Leaf categories (no children)
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
    const snapshot = await Collections.categories().limit(1000).get();
    const all = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as any);
    const parentIds = new Set<string>();
    all.forEach((c) => {
      if (c.parent_id) parentIds.add(c.parent_id);
    });
    const leaves = all.filter((c) => !parentIds.has(c.id));
    return NextResponse.json({ success: true, data: leaves });
  } catch (error) {
    console.error("Error fetching leaf categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leaf categories" },
      { status: 500 },
    );
  }
}
