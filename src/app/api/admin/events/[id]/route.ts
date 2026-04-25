import { withProviders } from "@/providers.config";
import { EVENT_FIELDS } from "@/constants/field-names";
import { z } from "zod";
import {
  eventRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
} from "@mohasinac/appkit";

const updateEventSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  status: z.string().optional(),
}).passthrough();

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const events = await eventRepository.list({ filters: `id==${id}`, page: "1", pageSize: "1" });
      const event = events.items[0];
      if (!event) return errorResponse("Event not found", 404);
      return successResponse(event);
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<(typeof updateEventSchema)["_output"]>({
    auth: true,
    roles: ["admin", "moderator"],
    schema: updateEventSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      const { startsAt, endsAt, ...rest } = body!;
      const updateData = {
        ...rest,
        ...(startsAt && { startsAt: new Date(startsAt) }),
        ...(endsAt && { endsAt: new Date(endsAt) }),
      };
      const updated = await eventRepository.updateEvent(id, updateData as any);
      return successResponse(updated, "Event updated");
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin"],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      await eventRepository.changeStatus(id, EVENT_FIELDS.STATUS_VALUES.CANCELLED as any);
      return successResponse(null, "Event cancelled");
    },
  }),
);
