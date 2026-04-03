/**
 * Admin Event Status API Route
 * PATCH /api/admin/events/[id]/status — Change event status
 *
 * Allowed transitions:
 *   draft   -> active
 *   active  -> paused | ended
 *   paused  -> active | ended
 */

import { z } from "zod";
import { createRouteHandler } from "@mohasinac/next";
import { successResponse } from "@/lib/api-response";
import { eventRepository } from "@/repositories";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  draft: ["active"],
  active: ["paused", "ended"],
  paused: ["active", "ended"],
  ended: [],
};

const changeStatusSchema = z.object({
  status: z.enum(["draft", "active", "paused", "ended"]),
});

export const PATCH = createRouteHandler<
  (typeof changeStatusSchema)["_output"],
  { id: string }
>({
  auth: true,
  roles: ["admin"],
  schema: changeStatusSchema,
  handler: async ({ body, params }) => {
    const id = params!.id;

    const event = await eventRepository.findById(id);
    if (!event) throw new NotFoundError(ERROR_MESSAGES.EVENT.NOT_FOUND);

    const allowed = ALLOWED_TRANSITIONS[event.status] ?? [];
    if (!allowed.includes(body!.status)) {
      throw new ValidationError(ERROR_MESSAGES.EVENT.INVALID_STATUS_TRANSITION);
    }

    const updated = await eventRepository.changeStatus(id, body!.status);
    serverLogger.info("Admin event status changed", {
      eventId: id,
      from: event.status,
      to: body!.status,
    });

    return successResponse(updated, SUCCESS_MESSAGES.EVENT.STATUS_CHANGED);
  },
});
