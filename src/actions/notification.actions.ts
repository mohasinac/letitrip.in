"use server";

/**
 * Notification Server Actions
 *
 * Mark notifications as read — directly calls the repository, bypassing
 * the service → apiClient → API route chain.
 */

import { requireAuth } from "@/lib/firebase/auth-server";
import { notificationRepository } from "@/repositories";
import { rateLimitByIdentifier, RateLimitPresets } from "@/lib/security";
import { AuthorizationError, ValidationError } from "@/lib/errors";

/**
 * Mark a single notification as read.
 */
export async function markNotificationReadAction(id: string): Promise<void> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `notifications:markRead:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!id || typeof id !== "string") {
    throw new ValidationError("Notification id is required");
  }

  await notificationRepository.markAsRead(id);
}

/**
 * Mark all notifications as read for the authenticated user.
 */
export async function markAllNotificationsReadAction(): Promise<number> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `notifications:markAllRead:${user.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  return notificationRepository.markAllAsRead(user.uid);
}
