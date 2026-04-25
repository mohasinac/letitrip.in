import { withProviders } from "@/providers.config";
import { EVENT_FIELDS } from "@/constants/field-names";
import { z } from "zod";
import {
  eventRepository,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";

const updateStatusSchema = z.object({
  status: z.enum(Object.values(EVENT_FIELDS.STATUS_VALUES) as [string, ...string[]]),
});

export const PATCH = withProviders(
  createRouteHandler<(typeof updateStatusSchema)["_output"]>({
    auth: true,
    roles: ["admin", "moderator"],
    schema: updateStatusSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      await eventRepository.changeStatus(id, body!.status as any);
      return successResponse({ id, status: body!.status }, "Event status updated");
    },
  }),
);
