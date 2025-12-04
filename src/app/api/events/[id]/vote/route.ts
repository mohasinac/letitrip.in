import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "@/app/api/lib/session";
import { logError } from "@/lib/firebase-error-logger";
import { z } from "zod";

const voteSchema = z.object({
  optionId: z.string().min(1, "Option is required"),
});

/**
 * POST /api/events/[id]/vote
 * Vote in poll event (authenticated users)
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

    // Check if event is a poll
    if (!eventData?.isPollEvent) {
      return NextResponse.json(
        { success: false, error: "This event is not a poll" },
        { status: 400 },
      );
    }

    // Check if event is published
    if (eventData.status !== "published") {
      return NextResponse.json(
        { success: false, error: "Event not available for voting" },
        { status: 400 },
      );
    }

    // Check if voting period is active
    const now = new Date();
    const startDate = new Date(eventData.startDate);
    const endDate = new Date(eventData.endDate);

    if (now < startDate || now > endDate) {
      return NextResponse.json(
        { success: false, error: "Voting period is not active" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const validation = voteSchema.safeParse(body);

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

    const { optionId } = validation.data;

    // Verify option exists
    const optionDoc = await Collections.eventOptions().doc(optionId).get();
    if (!optionDoc.exists || optionDoc.data()?.eventId !== id) {
      return NextResponse.json(
        { success: false, error: "Invalid option" },
        { status: 400 },
      );
    }

    // Check if user already voted
    const existingVote = await Collections.eventVotes()
      .where("eventId", "==", id)
      .where("userId", "==", user.id)
      .limit(1)
      .get();

    if (!existingVote.empty && !eventData.allowMultipleVotes) {
      return NextResponse.json(
        { success: false, error: "You have already voted" },
        { status: 400 },
      );
    }

    // Create vote
    const voteRef = Collections.eventVotes().doc();
    const timestamp = new Date().toISOString();

    await voteRef.set({
      id: voteRef.id,
      eventId: id,
      optionId,
      userId: user.id,
      userName: user.name,
      votedAt: timestamp,
      createdAt: timestamp,
    });

    // Update vote counts
    const batch = Collections.events().firestore.batch();

    // Increment event vote count
    batch.update(Collections.events().doc(id), {
      voteCount: (eventData.voteCount || 0) + 1,
    });

    // Increment option vote count
    const optionData = optionDoc.data();
    batch.update(Collections.eventOptions().doc(optionId), {
      voteCount: (optionData?.voteCount || 0) + 1,
    });

    await batch.commit();

    return NextResponse.json(
      {
        success: true,
        vote: {
          id: voteRef.id,
          eventId: id,
          optionId,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    logError(error, {
      component: "EventsAPI.vote",
      action: "vote_in_poll",
    });
    return NextResponse.json(
      { success: false, error: "Failed to record vote" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/events/[id]/vote
 * Get voting results (public)
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

    if (!eventData?.isPollEvent) {
      return NextResponse.json(
        { success: false, error: "This event is not a poll" },
        { status: 400 },
      );
    }

    // Get all options with vote counts
    const optionsSnapshot = await Collections.eventOptions()
      .where("eventId", "==", id)
      .orderBy("order", "asc")
      .get();

    const options = optionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const totalVotes = eventData.voteCount || 0;

    return NextResponse.json({
      success: true,
      results: {
        eventId: id,
        totalVotes,
        options: options.map((option) => ({
          id: option.id,
          title: option.title,
          description: option.description,
          voteCount: option.voteCount || 0,
          percentage:
            totalVotes > 0 ? ((option.voteCount || 0) / totalVotes) * 100 : 0,
        })),
      },
    });
  } catch (error) {
    logError(error, {
      component: "EventsAPI.getResults",
      action: "get_voting_results",
    });
    return NextResponse.json(
      { success: false, error: "Failed to fetch voting results" },
      { status: 500 },
    );
  }
}
