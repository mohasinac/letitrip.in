/**
 * Admin Event Detail API Route
 * GET    /api/admin/events/[id] — Full event document
 * PUT    /api/admin/events/[id] — Update event
 * DELETE /api/admin/events/[id] — Hard-delete drafts; soft-delete (ended) for active
 */

import { z } from "zod";
import { createRouteHandler } from "@mohasinac/next";
import { successResponse } from "@/lib/api-response";
import { eventRepository } from "@/repositories";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { NotFoundError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";

// ---------------------------------------------------------------------------
// GET — fetch single event
// ---------------------------------------------------------------------------
export const GET = createRouteHandler<never, { id: string }>({
  auth: true,
  roles: ["admin", "moderator"],
  handler: async ({ params }) => {
    const id = params!.id;
    const event = await eventRepository.findById(id);
    if (!event) throw new NotFoundError(ERROR_MESSAGES.EVENT.NOT_FOUND);
    return successResponse(event);
  },
});

// ---------------------------------------------------------------------------
// PUT — update event
// ---------------------------------------------------------------------------
const updateEventSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  startsAt: z.string().datetime({ offset: true }).optional(),
  endsAt: z.string().datetime({ offset: true }).optional(),
  coverImageUrl: z.string().url().optional().nullable(),
  saleConfig: z.any().optional(),
  offerConfig: z.any().optional(),
  pollConfig: z.any().optional(),
  surveyConfig: z.any().optional(),
  feedbackConfig: z.any().optional(),
});

export const PUT = createRouteHandler<
  (typeof updateEventSchema)["_output"],
  { id: string }
>({
  auth: true,
  roles: ["admin"],
  schema: updateEventSchema,
  handler: async ({ body: rawBody, params }) => {
    const body = rawBody!;
    const id = params!.id;
    const existing = await eventRepository.findById(id);
    if (!existing) throw new NotFoundError(ERROR_MESSAGES.EVENT.NOT_FOUND);

    const updateData: Record<string, unknown> = { ...body };
    if (body?.startsAt) updateData.startsAt = new Date(body.startsAt);
    if (body?.endsAt) updateData.endsAt = new Date(body.endsAt);

    const updated = await eventRepository.updateEvent(id, updateData as never);
    serverLogger.info("Admin event updated", { eventId: id });
    return successResponse(updated, SUCCESS_MESSAGES.EVENT.UPDATED);
  },
});

// ---------------------------------------------------------------------------
// DELETE — remove event
// ---------------------------------------------------------------------------
export const DELETE = createRouteHandler<never, { id: string }>({
  auth: true,
  roles: ["admin"],
  handler: async ({ params }) => {
    const id = params!.id;
    const event = await eventRepository.findById(id);
    if (!event) throw new NotFoundError(ERROR_MESSAGES.EVENT.NOT_FOUND);

    if (event.status === "draft") {
      // Hard-delete drafts
      await eventRepository.delete(id);
      serverLogger.info("Admin event hard-deleted (draft)", { eventId: id });
    } else {
      // Soft-delete active/paused events by ending them
      await eventRepository.changeStatus(id, "ended");
      serverLogger.info("Admin event soft-deleted (set ended)", {
        eventId: id,
      });
    }

    return successResponse(null, SUCCESS_MESSAGES.EVENT.DELETED);
  },
});
