import { withProviders } from "@/providers.config";
import {
  EVENT_FIELDS,
  ROLES_ADMIN_MOD,
} from "@/constants";
import { z } from "zod";
import {
  eventRepository,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";

const updateStatusSchema = z.object({
  status: z.enum(Object.values(EVENT_FIELDS.STATUS_VALUES) as [string, ...string[]]),
});

const __PATCH__g = withProviders(
  createRouteHandler<(typeof updateStatusSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    schema: updateStatusSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      await eventRepository.changeStatus(id, body!.status as any);
      return successResponse({ id, status: body!.status }, "Event status updated");
    },
  }),
);

export const PATCH = __PATCH__g;
