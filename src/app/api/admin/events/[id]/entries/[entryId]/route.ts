/**
 * Admin Event Entry Review API Route
 * PATCH /api/admin/events/[id]/entries/[entryId] — Approve or flag an entry
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import { eventRepository, eventEntryRepository } from "@/repositories";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { NotFoundError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";

const reviewEntrySchema = z.object({
  reviewStatus: z.enum(["approved", "flagged"]),
  reviewNote: z.string().optional(),
});

export const PATCH = createApiHandler({
  auth: true,
  roles: ["admin", "moderator"],
  schema: reviewEntrySchema,
  handler: async (data) => {
    const body = data.body!;
    const user = data.user!;
    const request = data.request;
    const parts = request.nextUrl.pathname.split("/");
    // path: /api/admin/events/[id]/entries/[entryId]
    const entryId = parts[parts.length - 1];
    const eventId = parts[parts.length - 3];

    const [event, entry] = await Promise.all([
      eventRepository.findById(eventId),
      eventEntryRepository.findById(entryId),
    ]);

    if (!event) throw new NotFoundError(ERROR_MESSAGES.EVENT.NOT_FOUND);
    if (!entry) throw new NotFoundError(ERROR_MESSAGES.VALIDATION.FAILED);

    const updatedEntry = await eventEntryRepository.reviewEntry(
      entryId,
      body.reviewStatus,
      user.uid,
      body.reviewNote,
    );

    // Atomically update event stats
    if (body.reviewStatus === "approved") {
      await eventRepository.incrementApprovedEntries(eventId);
    } else {
      await eventRepository.incrementFlaggedEntries(eventId);
    }

    serverLogger.info("Admin event entry reviewed", {
      entryId,
      eventId,
      reviewStatus: body.reviewStatus,
      reviewedBy: user.uid,
    });

    const message =
      body.reviewStatus === "approved"
        ? SUCCESS_MESSAGES.EVENT.ENTRY_APPROVED
        : SUCCESS_MESSAGES.EVENT.ENTRY_FLAGGED;

    return successResponse(updatedEntry, message);
  },
});
