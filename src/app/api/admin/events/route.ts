import { Collections } from "@/app/api/lib/firebase/collections";
import { requireAuth } from "@/app/api/middleware/rbac-auth";
import {
  VALIDATION_MESSAGES,
  VALIDATION_RULES,
} from "@/constants/validation-messages";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const eventSchema = z.object({
  title: z
    .string()
    .min(VALIDATION_RULES.NAME.MIN_LENGTH, VALIDATION_MESSAGES.NAME.TOO_SHORT)
    .max(VALIDATION_RULES.NAME.MAX_LENGTH, VALIDATION_MESSAGES.NAME.TOO_LONG),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.enum(["workshop", "seminar", "competition", "poll", "announcement"]),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  location: z.string().optional(),
  isOnline: z.boolean().default(false),
  maxParticipants: z.number().positive().optional(),
  registrationDeadline: z.string().datetime().optional(),
  isPollEvent: z.boolean().default(false),
  allowMultipleVotes: z.boolean().default(false),
  imageUrl: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * GET /api/admin/events
 * List all events (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, ["admin"]);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = Collections.events().orderBy("createdAt", "desc");

    if (status) {
      query = query.where("status", "==", status);
    }
    if (type) {
      query = query.where("type", "==", type);
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
    logError(error, {
      component: "AdminEventsAPI.GET",
      action: "list_events",
    });
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/events
 * Create new event (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, ["admin"]);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = eventSchema.safeParse(body);

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

    const eventData = validation.data;

    // Validate dates
    const startDate = new Date(eventData.startDate);
    const endDate = new Date(eventData.endDate);

    if (endDate <= startDate) {
      return NextResponse.json(
        { success: false, error: "End date must be after start date" },
        { status: 400 }
      );
    }

    if (eventData.registrationDeadline) {
      const regDeadline = new Date(eventData.registrationDeadline);
      if (regDeadline >= startDate) {
        return NextResponse.json(
          {
            success: false,
            error: "Registration deadline must be before start date",
          },
          { status: 400 }
        );
      }
    }

    const eventRef = Collections.events().doc();
    const now = new Date().toISOString();

    await eventRef.set({
      ...eventData,
      id: eventRef.id,
      createdAt: now,
      updatedAt: now,
      createdBy: user.id,
      participantCount: 0,
      voteCount: 0,
    });

    const eventDoc = await eventRef.get();

    return NextResponse.json(
      {
        success: true,
        event: { id: eventDoc.id, ...eventDoc.data() },
      },
      { status: 201 }
    );
  } catch (error) {
    logError(error, {
      component: "AdminEventsAPI.POST",
      action: "create_event",
    });
    return NextResponse.json(
      { success: false, error: "Failed to create event" },
      { status: 500 }
    );
  }
}
