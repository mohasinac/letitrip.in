/**
 * @fileoverview TypeScript Module
 * @module src/app/api/events/[id]/vote/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "@/app/api/lib/session";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const voteSchema = z.object({
  /** Option Id */
  optionId: z.string().min(1, "Option is required"),
});

/**
 * POST /api/events/[id]/vote
 * Vote in poll event (authenticated users)
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
      /** Id */
      id: voteRef.id,
      /** Event Id */
      eventId: id,
      optionId,
      /** User Id */
      userId: user.id,
      /** User Name */
      userName: user.name,
      /** Voted At */
      votedAt: timestamp,
      /** Created At */
      createdAt: timestamp,
    });

    // Update vote counts
    const batch = Collections.events().firestore.batch();

    // Increment event vote count
    batch.update(Collections.events().doc(id), {
      /** Vote Count */
      voteCount: (eventData.voteCount || 0) + 1,
    });

    // Increment option vote count
    const optionData = optionDoc.data();
    batch.update(Collections.eventOptions().doc(optionId), {
      /** Vote Count */
      voteCount: (optionData?.voteCount || 0) + 1,
    });

    await batch.commit();

    return NextResponse.json(
      {
        /** Success */
        success: true,
        /** Vote */
        vote: {
          /** Id */
          id: voteRef.id,
          /** Event Id */
          eventId: id,
          optionId,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "EventsAPI.vote",
      /** Action */
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
      /** Id */
      id: doc.id,
      ...doc.data(),
    }));

    const totalVotes = eventData.voteCount || 0;

    return NextResponse.json({
      /** Success */
      success: true,
      /** Results */
      results: {
        /** Event Id */
        eventId: id,
        totalVotes,
        /** Options */
        options: options.map((option) => ({
          /** Id */
          id: option.id,
          /** Title */
          title: option.title,
          /** Description */
          description: option.description,
          /** Vote Count */
          voteCount: option.voteCount || 0,
          /** Percentage */
          percentage:
            totalVotes > 0 ? ((option.voteCount || 0) / totalVotes) * 100 : 0,
        })),
      },
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "EventsAPI.getResults",
      /** Action */
      action: "get_voting_results",
    });
    return NextResponse.json(
      { success: false, error: "Failed to fetch voting results" },
      { status: 500 },
    );
  }
}
