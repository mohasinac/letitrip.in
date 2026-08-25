import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  itemRequestCreateSchema,
  itemRequestsRepository,
  successResponse,
} from "@mohasinac/appkit";
import { ROLES_AUTHENTICATED } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: false,
    handler: async () => {
      const result = await itemRequestsRepository.listOpen({ limit: 50 });
      return successResponse({ items: result.items, total: result.items.length });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler<(typeof itemRequestCreateSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_AUTHENTICATED],
    schema: itemRequestCreateSchema,
    handler: async ({ user, body }) => {
      // This list is read by ANYONE (`GET` above is `auth: false`), so an
      // unvalidated write here was an unvalidated publish. The schema is
      // `.strict()` and declares neither `approvedAt` nor `approvedBy`, so a
      // caller can no longer forge the record of having been cleared.
      const doc = await itemRequestsRepository.create({
        ...body!,
        imageUrls: body!.imageUrls ?? [],
        opUserId: user!.uid,
        opDisplayName: user!.name ?? "Anonymous",
        status: "pending-approval",
        replies: [],
        replyCount: 0,
      });
      return successResponse(doc, "Request submitted for review", 201);
    },
  }),
);
