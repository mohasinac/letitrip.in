import { withProviders } from "@/providers.config";
import {
  EVENT_FIELDS,
  ROLES_ADMIN_MOD,
  ROLES_ADMIN_ONLY,
} from "@/constants";
import { z } from "zod";
import {
  eventRepository,
  adminGetEventById,
  createRouteHandler,
  successResponse,
  errorResponse,
  finalizeStagedMediaField,
  finalizeStagedMediaObject,
  finalizeStagedMediaObjectArray,
} from "@mohasinac/appkit";

/*
 * `.passthrough()` is deliberate here — an event carries open-ended
 * type-specific config that this schema does not enumerate, and tightening it
 * without a full-collection round-trip diff is the most dangerous edit
 * available on this route.
 *
 * 🛑 But `lotteryConfig` is CARVED OUT, because passthrough is exactly what
 * made it destructive. The authoring UI builds slots from form state with no
 * booking fields on them, so letting that through writes `isBooked: false`
 * over every slot a buyer has already pulled — silently, with a 200.
 *
 * It goes to `PUT ./lottery-config` instead, which is the only place that has
 * both the admin's intent and the stored bookings, and therefore the only
 * place a correct merge can happen. Refused loudly rather than dropped: a
 * caller that still sends it is doing something that used to destroy data,
 * and should be told, not quietly ignored.
 */
const updateEventSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  status: z.string().optional(),
  lotteryConfig: z
    .never({
      message:
        "lotteryConfig cannot be written here — use PUT /api/admin/events/{id}/lottery-config, " +
        "which preserves slots that have already been pulled.",
    })
    .optional(),
}).passthrough();

const __GET__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const event = await adminGetEventById(id);
      if (!event) return errorResponse("Event not found", 404);
      return successResponse(event);
    },
  }),
);

const __PATCH__g = withProviders(
  createRouteHandler<(typeof updateEventSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    schema: updateEventSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      const { startsAt, endsAt, coverImage, eventImages, winnerImages, additionalImages, ...rest } = body! as any;
      // Mirror POST's staged-media finalization (route.ts:205-218) — without
      // this, a PATCH that swaps in a newly-uploaded image leaves it sitting
      // in Storage tmp/ (status "staged") instead of being promoted like
      // create does.
      const coverImageUrl = coverImage !== undefined || rest.coverImageUrl !== undefined
        ? await finalizeStagedMediaField(coverImage?.url ?? rest.coverImageUrl)
        : undefined;
      const finalizedCoverImage = coverImage
        ? await finalizeStagedMediaObject({ ...coverImage, url: coverImageUrl ?? coverImage.url })
        : undefined;
      const updateData = {
        ...rest,
        ...(startsAt && { startsAt: new Date(startsAt) }),
        ...(endsAt && { endsAt: new Date(endsAt) }),
        ...(finalizedCoverImage && { coverImage: finalizedCoverImage, coverImageUrl: finalizedCoverImage.url }),
        ...(coverImageUrl !== undefined && !finalizedCoverImage && { coverImageUrl }),
        ...(eventImages !== undefined && { eventImages: await finalizeStagedMediaObjectArray(eventImages) }),
        ...(winnerImages !== undefined && { winnerImages: await finalizeStagedMediaObjectArray(winnerImages) }),
        ...(additionalImages !== undefined && { additionalImages: await finalizeStagedMediaObjectArray(additionalImages) }),
      };
      const updated = await eventRepository.updateEvent(id, updateData as any);
      return successResponse(updated, "Event updated");
    },
  }),
);

const __DELETE__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:events:delete",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      await eventRepository.changeStatus(id, EVENT_FIELDS.STATUS_VALUES.CANCELLED as any);
      return successResponse(null, "Event cancelled");
    },
  }),
);

export const GET = __GET__g;
export const PATCH = __PATCH__g;
export const DELETE = __DELETE__g;
