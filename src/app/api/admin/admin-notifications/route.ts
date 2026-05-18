import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  adminNotificationsRepository,
} from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin"],
    handler: async () => {
      const result = await adminNotificationsRepository.listUnread();
      return successResponse({ items: result.items });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin"],
    handler: async ({ request }) => {
      const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
      const doc = await adminNotificationsRepository.create({
        ...body,
        isRead: false,
      });
      return successResponse(doc, "Notification created", 201);
    },
  }),
);
