import { Collections } from "@/app/api/lib/firebase/collections";
import { requireRole } from "@/app/api/middleware/rbac-auth";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateEventSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).optional(),
  type: z
    .enum(["workshop", "seminar", "competition", "poll", "announcement"])
    .optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  location: z.string().optional(),
  isOnline: z.boolean().optional(),
  maxParticipants: z.number().positive().optional(),
  registrationDeadline: z.string().datetime().optional(),
  isPollEvent: z.boolean().optional(),
  allowMultipleVotes: z.boolean().optional(),
  imageUrl: z.string().url().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

/**
 * GET /api/admin/events/[id]
 * Get single event (admin only)
 */
export async function GET(
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
      success: true,
      event: { id: eventDoc.id, ...eventDoc.data() },
    });
  } catch (error) {
    logError(error as Error, {
      component: "AdminEventsAPI.GET",
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
export async function PUT(
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
          success: false,
          error: "Validation failed",
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
        updatedAt: new Date().toISOString(),
        updatedBy: user.uid,
      });

    const updatedDoc = await Collections.events().doc(id).get();

    return NextResponse.json({
      success: true,
      event: { id: updatedDoc.id, ...updatedDoc.data() },
    });
  } catch (error) {
    logError(error as Error, {
      component: "AdminEventsAPI.PUT",
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
export async function DELETE(
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
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    logError(error as Error, {
      component: "AdminEventsAPI.DELETE",
      action: "delete_event",
    });
    return NextResponse.json(
      { success: false, error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
