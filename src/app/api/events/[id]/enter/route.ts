/**
 * Public Event Entry API Route
 * POST /api/events/[id]/enter — Submit an entry / vote for an event
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import { resolveDate } from "@/utils";
import { eventRepository, eventEntryRepository } from "@/repositories";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";

const enterEventSchema = z.object({
  pollVotes: z.array(z.string()).optional(),
  pollComment: z.string().optional(),
  formResponses: z.record(z.string(), z.unknown()).optional(),
});

export const POST = createApiHandler({
  auth: false, // auth checked per-event based on config
  schema: enterEventSchema,
  handler: async (data) => {
    const body = data.body!;
    const user = data.user as
      | { uid: string; displayName?: string; email?: string }
      | undefined;
    const request = data.request;
    const parts = request.nextUrl.pathname.split("/");
    // path: /api/events/[id]/enter
    const id = parts[parts.length - 2];

    const event = await eventRepository.findById(id);
    if (!event || event.status !== "active") {
      throw new NotFoundError(ERROR_MESSAGES.EVENT.ENTRIES_CLOSED);
    }

    // Check event window
    const now = new Date();
    const endsAt = resolveDate(event.endsAt);
    if (endsAt && now > endsAt) {
      throw new ValidationError(ERROR_MESSAGES.EVENT.ENTRIES_CLOSED);
    }

    // Auth check for events that require login
    const requiresLogin =
      event.type === "poll" ||
      event.type === "survey" ||
      (event.type === "feedback" && !event.feedbackConfig?.anonymous);

    if (requiresLogin && !user) {
      throw new ValidationError(ERROR_MESSAGES.EVENT.LOGIN_REQUIRED);
    }

    // Max entries per user check (survey only)
    if (user && event.type === "survey" && event.surveyConfig) {
      const userEntryCount = await eventEntryRepository.countUserEntries(
        id,
        user.uid,
      );
      if (userEntryCount >= event.surveyConfig.maxEntriesPerUser) {
        throw new ValidationError(ERROR_MESSAGES.EVENT.ALREADY_ENTERED);
      }
    }

    // Poll: validate option IDs
    if (event.type === "poll" && event.pollConfig) {
      const validOptionIds = event.pollConfig.options.map((o) => o.id);
      const votes = body.pollVotes ?? [];
      if (votes.length === 0) {
        throw new ValidationError(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD);
      }
      if (!votes.every((v) => validOptionIds.includes(v))) {
        throw new ValidationError(ERROR_MESSAGES.VALIDATION.INVALID_INPUT);
      }
      if (!event.pollConfig.allowMultiSelect && votes.length > 1) {
        throw new ValidationError(ERROR_MESSAGES.VALIDATION.INVALID_INPUT);
      }
    }

    // Survey/feedback: validate required fields
    if (
      (event.type === "survey" || event.type === "feedback") &&
      event[`${event.type}Config` as "surveyConfig" | "feedbackConfig"]
    ) {
      const config =
        event[`${event.type}Config` as "surveyConfig" | "feedbackConfig"]!;
      const formFields = "formFields" in config ? config.formFields : [];
      for (const field of formFields) {
        if (field.required && !body.formResponses?.[field.id]) {
          throw new ValidationError(
            `${ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD}: ${field.label}`,
          );
        }
      }
    }

    // Determine whether this entry auto-approves
    const autoApprove =
      event.type === "poll" ||
      event.type === "feedback" ||
      (event.type === "survey" && !event.surveyConfig?.entryReviewRequired);

    const reviewStatus = autoApprove ? "approved" : "pending";

    const entry = await eventEntryRepository.createEntry({
      eventId: id,
      userId: user?.uid,
      userDisplayName: user?.displayName,
      userEmail: user?.email,
      pollVotes: body.pollVotes,
      pollComment: body.pollComment,
      formResponses: body.formResponses,
      reviewStatus,
      ipAddress:
        request.headers.get("x-forwarded-for")?.split(",")[0] ??
        request.headers.get("x-real-ip") ??
        undefined,
    });

    // Increment totalEntries
    await eventRepository.incrementTotalEntries(id);
    if (autoApprove) {
      await eventRepository.incrementApprovedEntries(id);
    }

    serverLogger.info("Event entry submitted", {
      entryId: entry.id,
      eventId: id,
      type: event.type,
      userId: user?.uid,
    });

    const message =
      event.type === "poll"
        ? SUCCESS_MESSAGES.EVENT.VOTE_SUBMITTED
        : SUCCESS_MESSAGES.EVENT.ENTRY_SUBMITTED;

    return successResponse({ entryId: entry.id }, message, 201);
  },
});
