/**
 * @fileoverview TypeScript Module
 * @module src/app/api/events/[id]/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { Collections } from "@/app/api/lib/firebase/collections";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/events/[id]
 * Get single published event (public)
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
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const eventDoc = await Collections.events().doc(id).get();

    if (!eventDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 },
      );
    }

    const eventData = eventDoc.data();

    // Only show published events to public
    if (eventData?.status !== "published") {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 },
      );
    }

    // Get event options if it's a poll
    let options = [];
    if (eventData.isPollEvent) {
      const optionsSnapshot = await Collections.eventOptions()
        .where("eventId", "==", id)
        .orderBy("order", "asc")
        .get();

      options = optionsSnapshot.docs.map((doc) => ({
        /** Id */
        id: doc.id,
        ...doc.data(),
      }));
    }

    return NextResponse.json({
      /** Success */
      success: true,
      /** Event */
      event: {
        /** Id */
        id: eventDoc.id,
        ...eventData,
        options,
      },
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "EventsAPI.GET",
      /** Action */
      action: "get_event",
    });
    return NextResponse.json(
      { success: false, error: "Failed to fetch event" },
      { status: 500 },
    );
  }
}
