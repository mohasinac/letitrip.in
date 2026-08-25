import { withProviders } from "@/providers.config";
import {
  adminNotificationsRepository,
  createRouteHandler,
  adminNotificationCreateSchema,
  successResponse,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:notifications:read",
    handler: async () => {
      const result = await adminNotificationsRepository.listUnread();
      return successResponse({ items: result.items });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler<(typeof adminNotificationCreateSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    schema: adminNotificationCreateSchema,
    handler: async ({ body }) => {
      // `isRead` / `readAt` are per-admin read state and belong to the
      // read/dismiss path — the schema declares neither, so a creator cannot
      // file a notification that is already marked read.
      const doc = await adminNotificationsRepository.create({
        ...body!,
        audienceUserIds: body!.audienceUserIds ?? [],
        isRead: false,
      });
      return successResponse(doc, "Notification created", 201);
    },
  }),
);
