"use server";

/**
 * Notification Server Actions — thin wrapper
 *
 * Business logic lives in @mohasinac/appkit/features/admin (notification actions).
 * This wrapper adds auth, rate-limiting, and Next.js server-action semantics.
 */

import { requireAuthUser } from "@mohasinac/appkit";
import {
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  listNotifications,
  getUnreadNotificationCount,
} from "@mohasinac/appkit";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit";
import { AuthorizationError, ValidationError } from "@mohasinac/appkit";
import type { NotificationDocument } from "@mohasinac/appkit";

export type { NotificationDocument };

/**
 * Mark a single notification as read.
 */
export async function markNotificationReadAction(id: string): Promise<void> {
  const user = await requireAuthUser();

  const rl = await rateLimitByIdentifier(
    `notifications:markRead:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!id || typeof id !== "string") {
    throw new ValidationError("Notification id is required");
  }

  await markNotificationRead(id);
}

/**
 * Mark all notifications as read for the authenticated user.
 */
export async function markAllNotificationsReadAction(): Promise<number> {
  const user = await requireAuthUser();

  const rl = await rateLimitByIdentifier(
    `notifications:markAllRead:${user.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  return markAllNotificationsRead(user.uid);
}

/**
 * Delete a single notification.
 */
export async function deleteNotificationAction(id: string): Promise<void> {
  const user = await requireAuthUser();

  const rl = await rateLimitByIdentifier(
    `notifications:delete:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!id || typeof id !== "string") {
    throw new ValidationError("Notification id is required");
  }

  await deleteNotification(id);
}

// ─── Read Actions ─────────────────────────────────────────────────────────────

export async function listNotificationsAction(
  limit = 20,
): Promise<{ notifications: NotificationDocument[]; unreadCount: number }> {
  const user = await requireAuthUser();
  return listNotifications(user.uid, limit);
}

export async function getUnreadNotificationCountAction(): Promise<number> {
  const user = await requireAuthUser();
  return getUnreadNotificationCount(user.uid);
}

