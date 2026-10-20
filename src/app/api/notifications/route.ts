import { withProviders } from "@/providers.config";
/**
 * Notifications API Route
 * GET  /api/notifications         â€” List user's notifications (paginated)
 * POST /api/notifications         â€” Create a notification (admin/system only)
 */

import { z } from "zod";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { notificationRepository } from "@mohasinac/appkit/features/admin/repository/notification.repository";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors/messages";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values/success-messages";
import { ROLES_ADMIN_ONLY } from "@/constants";
import { sendNotification } from "@mohasinac/appkit/server";
import { NOTIFICATION_TYPE_VALUES, NOTIFICATION_RELATED_TYPE_VALUES } from "@mohasinac/appkit";

/*
 * 🛑 F1 #3 (fixed) — this used to hand-write 16 of 28 notification types and
 * 6 of 12 related types. Any type added since landed here REJECTED: the
 * route 400'd a payload `sendNotification()` itself would have accepted.
 * Deriving from the canonical arrays means a new union member reaches this
 * route for free, same discipline as every other z.enum-over-a-union in this
 * codebase (Root Cause #61).
 */
const createNotificationSchema = z.object({
  userId: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
  type: z.enum(NOTIFICATION_TYPE_VALUES),
  priority: z.enum(["low", "normal", "high"] as const).default("normal"),
  title: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
  message: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
  imageUrl: z.string().optional(),
  actionUrl: z.string().optional(),
  actionLabel: z.string().optional(),
  relatedId: z.string().optional(),
  relatedType: z.enum(NOTIFICATION_RELATED_TYPE_VALUES).optional(),
});

/**
 * GET /api/notifications â€” List authenticated user's notifications
 */
export const GET = withProviders(createRouteHandler({
  auth: true,
  handler: async ({ request, user }) => {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20"), 50);

    serverLogger.info("Fetching notifications", { userId: user!.uid, limit });

    const [notifications, unreadCount] = await Promise.all([
      notificationRepository.findByUser(user!.uid, limit),
      notificationRepository.getUnreadCount(user!.uid),
    ]);

    return successResponse({ notifications, unreadCount });
  },
}));

/**
 * POST /api/notifications â€” Create a notification (admin only, or internal system calls)
 */
export const POST = withProviders(createRouteHandler({
  auth: true,
  roles: [...ROLES_ADMIN_ONLY],
  schema: createNotificationSchema,
  handler: async ({ body }) => {
    serverLogger.info("Creating notification", {
      userId: body!.userId,
      type: body!.type,
    });

    /*
     * Through `sendNotification`, so an admin-created notification behaves like
     * every other one: `actionUrl` resolved from relatedType + relatedId, and
     * the email fan-out applied subject to the recipient's own
     * preferences. A direct repository write produced an in-app row and nothing
     * else — which for an admin broadcast is precisely the wrong half.
     */
    const result = await sendNotification(body!);

    return successResponse(result, SUCCESS_MESSAGES.NOTIFICATION.SENT);
  },
}));
