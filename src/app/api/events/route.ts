/**
 * @fileoverview TypeScript Module
 * @module src/app/api/events/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { Collections } from "@/app/api/lib/firebase/collections";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/events
 * List published events (public)
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
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const upcoming = searchParams.get("upcoming") === "true";

    let query = Collections.events()
      .where("status", "==", "published")
      .orderBy("startDate", "asc");

    if (type) {
      query = query.where("type", "==", type);
    }

    if (upcoming) {
      const now = new Date().toISOString();
      query = query.where("startDate", ">=", now);
    }

    const snapshot = await query.limit(limit).offset(offset).get();

    /**
 * Performs events operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The events result
 *
 */
const events = snapshot.docs.map((doc) => ({
      /** Id */
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      /** Success */
      success: true,
      events,
      /** Count */
      count: events.length,
      /** Pagination */
      pagination: {
        limit,
        offset,
        /** Has More */
        hasMore: events.length === limit,
      },
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "EventsAPI.GET",
      /** Action */
      action: "list_events",
    });
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}
