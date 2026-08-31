import { withProviders } from "@/providers.config";
/**
 * Notifications API Route
 * GET  /api/notifications         â€” List user's notifications (paginated)
 * POST /api/notifications         â€” Create a notification (admin/system only)
 */

import { z } from "zod";
import { createRouteHandler } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import { notificationRepository } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { ERROR_MESSAGES } from "@mohasinac/appkit";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";
import { sendNotification } from "@mohasinac/appkit/server";

const createNotificationSchema = z.object({
  userId: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
  type: z.enum([
    "order_placed",
    "order_confirmed",
    "order_shipped",
    "order_delivered",
    "order_cancelled",
    "bid_placed",
    "bid_outbid",
    "bid_won",
    "bid_lost",
    "auction_ended",
    "review_approved",
    "review_replied",
    "product_available",
    "promotion",
    "system",
    "welcome",
  ] as const),
  priority: z.enum(["low", "normal", "high"] as const).default("normal"),
  title: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
  message: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
  imageUrl: z.string().optional(),
  actionUrl: z.string().optional(),
  actionLabel: z.string().optional(),
  relatedId: z.string().optional(),
  relatedType: z
    .enum(["order", "product", "bid", "review", "blog", "user"])
    .optional(),
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
     * the email / WhatsApp fan-out applied subject to the recipient's own
     * preferences. A direct repository write produced an in-app row and nothing
     * else — which for an admin broadcast is precisely the wrong half.
     */
    const result = await sendNotification(body!);

    return successResponse(result, SUCCESS_MESSAGES.NOTIFICATION.SENT);
  },
}));
