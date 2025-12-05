/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/events/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { Collections } from "@/app/api/lib/firebase/collections";
import { requireRole } from "@/app/api/middleware/rbac-auth";
import {
  VALIDATION_MESSAGES,
  VALIDATION_RULES,
} from "@/constants/validation-messages";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const eventSchema = z.object({
  /** Title */
  title: z
    .string()
    .min(VALIDATION_RULES.NAME.MIN_LENGTH, VALIDATION_MESSAGES.NAME.TOO_SHORT)
    .max(VALIDATION_RULES.NAME.MAX_LENGTH, VALIDATION_MESSAGES.NAME.TOO_LONG),
  /** Description */
  description: z.string().min(10, "Description must be at least 10 characters"),
  /** Type */
  type: z.enum(["workshop", "seminar", "competition", "poll", "announcement"]),
  /** Status */
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  /** Start Date */
  startDate: z.string().datetime(),
  /** End Date */
  endDate: z.string().datetime(),
  /** Location */
  location: z.string().optional(),
  /** Is Online */
  isOnline: z.boolean().default(false),
  /** Max Participants */
  maxParticipants: z.number().positive().optional(),
  /** Registration Deadline */
  registrationDeadline: z.string().datetime().optional(),
  /** Is Poll Event */
  isPollEvent: z.boolean().default(false),
  /** Allow Multiple Votes */
  allowMultipleVotes: z.boolean().default(false),
  /** Image Url */
  imageUrl: z.string().url().optional(),
  /** Metadata */
  metadata: z.record(z.string(), z.any()).optional(),
});

/**
 * GET /api/admin/events
 * List all events (admin only)
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request);
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request);
 */

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRole(request, ["admin"]);
    if (authResult.error) return authResult.error;
    const { user } = authResult;

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

    /**
 * Performs events operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The events result
 *
 */
const events = snapshot.docs.map((doc) => ({
      /** Id */
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      /** Success */
      success: true,
      events,
      /** Count */
      count: events.length,
      /** Pagination */
      pagination: {
        limit,
        offset,
        /** Has More */
        hasMore: events.length === limit,
      },
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "AdminEventsAPI.GET",
      /** Action */
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
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(req);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(req);
 */

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ["admin"]);
    if (authResult.error) return authResult.error;
    const { user } = authResult;

    const body = await req.json();
    const validation = eventSchema.safeParse(body);

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
            /** Success */
            success: false,
            /** Error */
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
      /** Id */
      id: eventRef.id,
      /** Created At */
      createdAt: now,
      /** Updated At */
      updatedAt: now,
      /** Created By */
      createdBy: user.uid,
      /** Participant Count */
      participantCount: 0,
      /** Vote Count */
      voteCount: 0,
    });

    const eventDoc = await eventRef.get();

    return NextResponse.json(
      {
        /** Success */
        success: true,
        /** Event */
        event: { id: eventDoc.id, ...eventDoc.data() },
      },
      { status: 201 }
    );
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "AdminEventsAPI.POST",
      /** Action */
      action: "create_event",
    });
    return NextResponse.json(
      { success: false, error: "Failed to create event" },
      { status: 500 }
    );
  }
}
