/**
 * Individual Notification API Route
 * PATCH  /api/notifications/[id] — Mark notification as read
 * DELETE /api/notifications/[id] — Delete a notification
 */

import { successResponse, errorResponse } from "@mohasinac/appkit/next";
import { NotFoundError, AuthorizationError } from "@mohasinac/appkit/errors";
import { notificationRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { createRouteHandler } from "@mohasinac/appkit/next";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit/security";

type IdParams = { id: string };

/**
 * PATCH /api/notifications/[id] — Mark as read
 */
export const PATCH = createRouteHandler<never, IdParams>({
  auth: true,
  handler: async ({ request, user, params }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.API);
    if (!rl.success) return errorResponse("Too many requests", 429);
    const { id } = params!;

    const notification = await notificationRepository.findById(id);
    if (!notification)
      throw new NotFoundError(ERROR_MESSAGES.NOTIFICATION.NOT_FOUND);

    if (notification.userId !== user!.uid && user!.role !== "admin") {
      throw new AuthorizationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    }

    serverLogger.info("Marking notification as read", {
      id,
      userId: user!.uid,
    });
    const updated = await notificationRepository.markAsRead(id);
    return successResponse(updated, SUCCESS_MESSAGES.NOTIFICATION.READ);
  },
});

/**
 * DELETE /api/notifications/[id] — Delete a notification
 */
export const DELETE = createRouteHandler<never, IdParams>({
  auth: true,
  handler: async ({ request, user, params }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.API);
    if (!rl.success) return errorResponse("Too many requests", 429);
    const { id } = params!;

    const notification = await notificationRepository.findById(id);
    if (!notification)
      throw new NotFoundError(ERROR_MESSAGES.NOTIFICATION.NOT_FOUND);

    if (notification.userId !== user!.uid && user!.role !== "admin") {
      throw new AuthorizationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    }

    serverLogger.info("Deleting notification", { id, userId: user!.uid });
    await notificationRepository.delete(id);
    return successResponse({ id }, SUCCESS_MESSAGES.NOTIFICATION.DELETED);
  },
});
