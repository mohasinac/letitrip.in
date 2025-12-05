/**
 * @fileoverview TypeScript Module
 * @module src/app/api/events/[id]/register/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "@/app/api/lib/session";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const registerSchema = z.object({
  /** Form Data */
  formData: z.record(z.string(), z.any()).optional(),
  /** Additional Info */
  additionalInfo: z.string().optional(),
});

/**
 * POST /api/events/[id]/register
 * Register for event (authenticated users)
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request, {});
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(/** Request */
  request, {});
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params: Promise<{ id: string }> }} { params } - The { params }
 *
 * @returns {Promise<any>} The post result
 *
 * @example
 * POST(request, {});
 */
export async function POST(
  /** Request */
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const eventDoc = await Collections.events().doc(id).get();

    if (!eventDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 },
      );
    }

    const eventData = eventDoc.data();

    // Check if event is published
    if (eventData?.status !== "published") {
      return NextResponse.json(
        { success: false, error: "Event not available for registration" },
        { status: 400 },
      );
    }

    // Check if registration deadline has passed
    if (eventData.registrationDeadline) {
      const deadline = new Date(eventData.registrationDeadline);
      if (new Date() > deadline) {
        return NextResponse.json(
          { success: false, error: "Registration deadline has passed" },
          { status: 400 },
        );
      }
    }

    // Check if already registered
    const existingRegistration = await Collections.eventRegistrations()
      .where("eventId", "==", id)
      .where("userId", "==", user.id)
      .limit(1)
      .get();

    if (!existingRegistration.empty) {
      return NextResponse.json(
        { success: false, error: "Already registered for this event" },
        { status: 400 },
      );
    }

    // Check if event is full
    if (eventData.maxParticipants) {
      if (eventData.participantCount >= eventData.maxParticipants) {
        return NextResponse.json(
          { success: false, error: "Event is full" },
          { status: 400 },
        );
      }
    }

    const body = await request.json();
    const validation = registerSchema.safeParse(body);

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
        { status: 400 },
      );
    }

    const registrationData = validation.data;

    // Create registration
    const registrationRef = Collections.eventRegistrations().doc();
    const now = new Date().toISOString();

    await registrationRef.set({
      /** Id */
      id: registrationRef.id,
      /** Event Id */
      eventId: id,
      /** User Id */
      userId: user.id,
      /** User Name */
      userName: user.name,
      /** User Email */
      userEmail: user.email,
      /** Form Data */
      formData: registrationData.formData || {},
      /** Additional Info */
      additionalInfo: registrationData.additionalInfo || "",
      /** Status */
      status: "confirmed",
      /** Registered At */
      registeredAt: now,
      /** Created At */
      createdAt: now,
    });

    // Increment participant count
    await Collections.events()
      .doc(id)
      .update({
        /** Participant Count */
        participantCount: (eventData.participantCount || 0) + 1,
      });

    return NextResponse.json(
      {
        /** Success */
        success: true,
        /** Registration */
        registration: {
          /** Id */
          id: registrationRef.id,
          /** Event Id */
          eventId: id,
          /** User Id */
          userId: user.id,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "EventsAPI.register",
      /** Action */
      action: "register_for_event",
    });
    return NextResponse.json(
      { success: false, error: "Failed to register for event" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/events/[id]/register
 * Check registration status (authenticated users)
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
  r/**
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
equest
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
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const registrationSnapshot = await Collections.eventRegistrations()
      .where("eventId", "==", id)
      .where("userId", "==", user.id)
      .limit(1)
      .get();

    if (registrationSnapshot.empty) {
      return NextResponse.json({
        /** Success */
        success: true,
        /** Registered */
        registered: false,
      });
    }

    const registration = registrationSnapshot.docs[0];

    return NextResponse.json({
      /** Success */
      success: true,
      /** Registered */
      registered: true,
      /** Registration */
      registration: {
        /** Id */
        id: registration.id,
        ...registration.data(),
      },
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "EventsAPI.checkRegistration",
      /** Action */
      action: "check_registration_status",
    });
    return NextResponse.json(
      { success: false, error: "Failed to check registration status" },
      { status: 500 },
    );
  }
}
