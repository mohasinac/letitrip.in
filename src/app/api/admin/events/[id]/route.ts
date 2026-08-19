import { withFeatureGuard } from "@/lib/features";
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

const updateEventSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  status: z.string().optional(),
}).passthrough();

const __GET__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:events:read",
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
    permission: "admin:events:write",
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

export const GET = withFeatureGuard("EVENTS", __GET__g);
export const PATCH = withFeatureGuard("EVENTS", __PATCH__g);
export const DELETE = withFeatureGuard("EVENTS", __DELETE__g);
