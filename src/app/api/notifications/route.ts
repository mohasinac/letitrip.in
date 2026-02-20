/**
 * Notifications API Route
 * GET  /api/notifications         — List user's notifications (paginated)
 * POST /api/notifications         — Create a notification (admin/system only)
 */

import { z } from "zod";
import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import { notificationRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { NotificationType, NotificationPriority } from "@/db/schema";

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
    "review_approved",
    "review_replied",
    "product_available",
    "promotion",
    "system",
    "welcome",
  ] as [NotificationType, ...NotificationType[]]),
  priority: z
    .enum(["low", "normal", "high"] as [
      NotificationPriority,
      ...NotificationPriority[],
    ])
    .default("normal"),
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
 * GET /api/notifications — List authenticated user's notifications
 */
export const GET = createApiHandler({
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
});

/**
 * POST /api/notifications — Create a notification (admin only, or internal system calls)
 */
export const POST = createApiHandler({
  auth: true,
  roles: ["admin"],
  schema: createNotificationSchema,
  handler: async ({ body }) => {
    serverLogger.info("Creating notification", {
      userId: body!.userId,
      type: body!.type,
    });

    const notification = await notificationRepository.create(body!);

    return successResponse(notification, SUCCESS_MESSAGES.NOTIFICATION.SENT);
  },
});
