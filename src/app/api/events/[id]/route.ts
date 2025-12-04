import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { logError } from "@/lib/firebase-error-logger";

/**
 * GET /api/events/[id]
 * Get single published event (public)
 */
export async function GET(
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
        id: doc.id,
        ...doc.data(),
      }));
    }

    return NextResponse.json({
      success: true,
      event: {
        id: eventDoc.id,
        ...eventData,
        options,
      },
    });
  } catch (error) {
    logError(error, {
      component: "EventsAPI.GET",
      action: "get_event",
    });
    return NextResponse.json(
      { success: false, error: "Failed to fetch event" },
      { status: 500 },
    );
  }
}
