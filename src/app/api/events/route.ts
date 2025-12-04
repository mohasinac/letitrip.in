import { Collections } from "@/app/api/lib/firebase/collections";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/events
 * List published events (public)
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

    const events = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      events,
      count: events.length,
      pagination: {
        limit,
        offset,
        hasMore: events.length === limit,
      },
    });
  } catch (error) {
    logError(error as Error, {
      component: "EventsAPI.GET",
      action: "list_events",
    });
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}
