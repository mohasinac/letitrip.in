/**
 * Individual Notification API Route
 * PATCH  /api/notifications/[id] — Mark notification as read
 * DELETE /api/notifications/[id] — Delete a notification
 */

import { NextRequest } from "next/server";
import { successResponse } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/firebase/auth-server";
import { handleApiError } from "@/lib/errors/error-handler";
import {
  AuthenticationError,
  NotFoundError,
  AuthorizationError,
} from "@/lib/errors";
import { userRepository, notificationRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function getUser() {
  const authUser = await getAuthenticatedUser();
  if (!authUser)
    throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
  const firestoreUser = await userRepository.findById(authUser.uid);
  if (!firestoreUser)
    throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
  return { ...authUser, role: firestoreUser.role || "user" };
}

/**
 * PATCH /api/notifications/[id] — Mark as read
 */
export async function PATCH(_request: NextRequest, context: RouteContext) {
  try {
    const user = await getUser();
    const { id } = await context.params;

    const notification = await notificationRepository.findById(id);
    if (!notification)
      throw new NotFoundError(ERROR_MESSAGES.NOTIFICATION.NOT_FOUND);

    // Users can only mark their own notifications as read
    if (notification.userId !== user.uid && user.role !== "admin") {
      throw new AuthorizationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    }

    serverLogger.info("Marking notification as read", { id, userId: user.uid });
    const updated = await notificationRepository.markAsRead(id);
    return successResponse(updated, SUCCESS_MESSAGES.NOTIFICATION.READ);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/notifications/[id] — Delete a notification
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const user = await getUser();
    const { id } = await context.params;

    const notification = await notificationRepository.findById(id);
    if (!notification)
      throw new NotFoundError(ERROR_MESSAGES.NOTIFICATION.NOT_FOUND);

    // Users can only delete their own notifications
    if (notification.userId !== user.uid && user.role !== "admin") {
      throw new AuthorizationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    }

    serverLogger.info("Deleting notification", { id, userId: user.uid });
    await notificationRepository.delete(id);
    return successResponse({ id }, SUCCESS_MESSAGES.NOTIFICATION.DELETED);
  } catch (error) {
    return handleApiError(error);
  }
}
