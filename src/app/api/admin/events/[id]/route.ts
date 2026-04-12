/**
 * Admin Event Detail API Route
 * GET    /api/admin/events/[id] — Full event document
 * PUT    /api/admin/events/[id] — Update event
 * DELETE /api/admin/events/[id] — Hard-delete drafts; soft-delete (ended) for active
 */

import { z } from "zod";
import { createApiHandler as createRouteHandler } from "@/lib/api/api-handler";
import { successResponse } from "@mohasinac/appkit/next";
import { eventRepository } from "@/repositories";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { NotFoundError } from "@mohasinac/appkit/errors";
import { serverLogger } from "@/lib/server-logger";
import { mediaFieldSchema } from "@mohasinac/appkit/utils";
import {
  finalizeStagedMediaField,
  finalizeStagedMediaObject,
  finalizeStagedMediaObjectArray,
} from "@/lib/media/finalize";

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
  coverImage: mediaFieldSchema.nullable().optional(),
  coverImageUrl: z.string().url().optional().nullable(),
  eventImages: z.array(mediaFieldSchema).max(10).optional(),
  winnerImages: z.array(mediaFieldSchema).max(5).optional(),
  additionalImages: z.array(mediaFieldSchema).max(10).optional(),
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
    if (body?.coverImageUrl === null) {
      updateData.coverImage = null;
      updateData.coverImageUrl = undefined;
    } else {
      const coverImageUrl = await finalizeStagedMediaField(
        body.coverImage?.url ?? body.coverImageUrl ?? existing.coverImageUrl,
      );
      const coverImage = body.coverImage
        ? await finalizeStagedMediaObject({
            ...body.coverImage,
            url: coverImageUrl ?? body.coverImage.url,
          })
        : body.coverImageUrl
          ? await finalizeStagedMediaObject({
              url: coverImageUrl ?? body.coverImageUrl,
              type: "image",
            })
          : existing.coverImage;

      updateData.coverImage = coverImage;
      updateData.coverImageUrl = coverImage?.url ?? coverImageUrl;
    }
    if (body?.eventImages) {
      updateData.eventImages = await finalizeStagedMediaObjectArray(
        body.eventImages,
      );
    }
    if (body?.winnerImages) {
      updateData.winnerImages = await finalizeStagedMediaObjectArray(
        body.winnerImages,
      );
    }
    if (body?.additionalImages) {
      updateData.additionalImages = await finalizeStagedMediaObjectArray(
        body.additionalImages,
      );
    }

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
