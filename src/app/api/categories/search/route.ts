/**
 * @fileoverview TypeScript Module
 * @module src/app/api/categories/search/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";

// GET /api/categories/search?q=term
/**
 * Function: G E T
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
    const { searchParams } = new URL(request.url);
    /**
     * Performs q operation
     *
     * @returns {any} The q result
     */

    /**
     * Performs q operation
     *
     * @returns {any} The q result
     */

    const q = (searchParams.get("q") || "").toLowerCase().trim();
    if (!q) return NextResponse.json({ success: true, data: [] });

    // naive contains search on name/description
    const snap = await Collections.categories().limit(500).get();
    const results = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as any)
      .filter(
        (c) =>
          (c.name || "").toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q),
      )
      .slice(0, 50);

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Category search error:", error);
    return NextResponse.json(
      { success: false, error: "Search failed" },
      { status: 500 },
    );
  }
}
