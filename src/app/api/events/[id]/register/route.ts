import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "@/app/api/lib/session";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const registerSchema = z.object({
  formData: z.record(z.string(), z.any()).optional(),
  additionalInfo: z.string().optional(),
});

/**
 * POST /api/events/[id]/register
 * Register for event (authenticated users)
 */
export async function POST(
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
          success: false,
          error: "Validation failed",
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
      id: registrationRef.id,
      eventId: id,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      formData: registrationData.formData || {},
      additionalInfo: registrationData.additionalInfo || "",
      status: "confirmed",
      registeredAt: now,
      createdAt: now,
    });

    // Increment participant count
    await Collections.events()
      .doc(id)
      .update({
        participantCount: (eventData.participantCount || 0) + 1,
      });

    return NextResponse.json(
      {
        success: true,
        registration: {
          id: registrationRef.id,
          eventId: id,
          userId: user.id,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    logError(error as Error, {
      component: "EventsAPI.register",
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
export async function GET(
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
        success: true,
        registered: false,
      });
    }

    const registration = registrationSnapshot.docs[0];

    return NextResponse.json({
      success: true,
      registered: true,
      registration: {
        id: registration.id,
        ...registration.data(),
      },
    });
  } catch (error) {
    logError(error as Error, {
      component: "EventsAPI.checkRegistration",
      action: "check_registration_status",
    });
    return NextResponse.json(
      { success: false, error: "Failed to check registration status" },
      { status: 500 },
    );
  }
}
