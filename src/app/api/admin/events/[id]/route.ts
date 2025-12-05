/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/events/[id]/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { Collections } from "@/app/api/lib/firebase/collections";
import { requireRole } from "@/app/api/middleware/rbac-auth";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateEventSchema = z.object({
  /** Title */
  title: z.string().min(3).max(200).optional(),
  /** Description */
  description: z.string().min(10).optional(),
  /** Type */
  type: z
    .enum(["workshop", "seminar", "competition", "poll", "announcement"])
    .optional(),
  /** Status */
  status: z.enum(["draft", "published", "archived"]).optional(),
  /** Start Date */
  startDate: z.string().datetime().optional(),
  /** End Date */
  endDate: z.string().datetime().optional(),
  /** Location */
  location: z.string().optional(),
  /** Is Online */
  isOnline: z.boolean().optional(),
  /** Max Participants */
  maxParticipants: z.number().positive().optional(),
  /** Registration Deadline */
  registrationDeadline: z.string().datetime().optional(),
  /** Is Poll Event */
  isPollEvent: z.boolean().optional(),
  /** Allow Multiple Votes */
  allowMultipleVotes: z.boolean().optional(),
  /** Image Url */
  imageUrl: z.string().url().optional(),
  /** Metadata */
  metadata: z.record(z.string(), z.any()).optional(),
});

/**
 * GET /api/admin/events/[id]
 * Get single event (admin only)
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

/**
 * Retrieves 
 *
 * @param {NextRequest} request - The request
 * @param {{ params: Promise<{ id: string }> }} { params } - The { params }
 *
 * @returns {Promise<any>} The get result
 *
 * @example
 * GET(request, {});
 */
export async function GET(
  /** Request */
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireRole(request, ["admin"]);
    if (authResult.error) return authResult.error;
    const { user } = authResult;

    const { id } = await params;
    const eventDoc = await Collections.events().doc(id).get();

    if (!eventDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      /** Success */
      success: true,
      /** Event */
      event: { id: eventDoc.id, ...eventDoc.data() },
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "AdminEventsAPI.GET",
      /** Action */
      action: "get_event",
    });
    return NextResponse.json(
      { success: false, error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/events/[id]
 * Update event (admin only)
 */
/**
 * Performs p u t operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to put result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PUT(request, {});
 */

/**
 * Performs p u t operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 * @param {/**
 * Performs p u t operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params: Promise<{ id: string }> }} { params } - The { params }
 *
 * @returns {Promise<any>} The put result
 *
 * @example
 * PUT(request, {});
 */
{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to put result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PUT(/** Request */
  request, {});
 */

export async function PUT(
  /** Request */
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireRole(request, ["admin"]);
    if (authResult.error) return authResult.error;
    const { user } = authResult;

    const { id } = await params;
    const eventDoc = await Collections.events().doc(id).get();

    if (!eventDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = updateEventSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          /** Success */
          success: false,
          /** Error */
          error: "Validation failed",
          /** Details */
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    // Validate dates if provided
    if (updateData.startDate && updateData.endDate) {
      const startDate = new Date(updateData.startDate);
      const endDate = new Date(updateData.endDate);

      if (endDate <= startDate) {
        return NextResponse.json(
          { success: false, error: "End date must be after start date" },
          { status: 400 }
        );
      }
    }

    await Collections.events()
      .doc(id)
      .update({
        ...updateData,
        /** Updated At */
        updatedAt: new Date().toISOString(),
        /** Updated By */
        updatedBy: user.uid,
      });

    const updatedDoc = await Collections.events().doc(id).get();

    return NextResponse.json({
      /** Success */
      success: true,
      /** Event */
      event: { id: updatedDoc.id, ...updatedDoc.data() },
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "AdminEventsAPI.PUT",
      /** Action */
      action: "update_event",
    });
    return NextResponse.json(
      { success: false, error: "Failed to update event" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/events/[id]
 * Delete event (admin only)
 */
/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to delete result
 *
 * @thro/**
 * Deletes 
 *
 * @param {NextRequest} request - The request
 * @param {{ params: Promise<{ id: string }> }} { params } - The { params }
 *
 * @returns {Promise<any>} The delete result
 *
 * @example
 * DELETE(request, {});
 */
ws {Error} When operation fails or validation errors occur
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireRole(request, ["admin"]);
    if (authResult.error) return authResult.error;
    const { user } = authResult;

    const { id } = await params;
    const eventDoc = await Collections.events().doc(id).get();

    if (!eventDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Delete event registrations and votes
    const batch = Collections.events().firestore.batch();

    // Delete registrations
    const registrationsSnapshot = await Collections.eventRegistrations()
      .where("eventId", "==", id)
      .get();
    registrationsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete votes
    const votesSnapshot = await Collections.eventVotes()
      .where("eventId", "==", id)
      .get();
    votesSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete event options (for polls)
    const optionsSnapshot = await Collections.eventOptions()
      .where("eventId", "==", id)
      .get();
    optionsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete event itself
    batch.delete(Collections.events().doc(id));

    await batch.commit();

    return NextResponse.json({
      /** Success */
      success: true,
      /** Message */
      message: "Event deleted successfully",
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "AdminEventsAPI.DELETE",
      /** Action */
      action: "delete_event",
    });
    return NextResponse.json(
      { success: false, error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
