"use server";

/**
 * Admin Server Actions
 *
 * Admin-only mutations that call repositories directly,
 * bypassing the service → apiClient → API route chain.
 *
 * All actions require admin or moderator role.
 */

import { z } from "zod";
import { requireRole } from "@/lib/firebase/auth-server";
import { sessionRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import { rateLimitByIdentifier, RateLimitPresets } from "@/lib/security";
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";

// ─── Schemas ──────────────────────────────────────────────────────────────

const revokeSessionSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required"),
});

const revokeUserSessionsSchema = z.object({
  userId: z.string().min(1, "userId is required"),
});

// ─── Server Actions ────────────────────────────────────────────────────────

/**
 * Revoke a single session (admin only).
 */
export async function revokeSessionAction(
  input: z.infer<typeof revokeSessionSchema>,
): Promise<{ success: true; message: string }> {
  const admin = await requireRole(["admin", "moderator"]);

  const rl = await rateLimitByIdentifier(
    `revoke-session:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = revokeSessionSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid input",
    );
  }

  const { sessionId } = parsed.data;
  const session = await sessionRepository.findById(sessionId);
  if (!session) throw new NotFoundError("Session not found");

  await sessionRepository.revokeSession(sessionId, admin.uid);

  serverLogger.info("revokeSessionAction", {
    adminId: admin.uid,
    sessionId,
    targetUserId: session.userId,
  });

  return { success: true, message: "Session revoked" };
}

/**
 * Revoke all sessions for a user (admin only).
 */
export async function revokeUserSessionsAction(
  input: z.infer<typeof revokeUserSessionsSchema>,
): Promise<{ success: true; message: string; revokedCount: number }> {
  const admin = await requireRole(["admin", "moderator"]);

  const rl = await rateLimitByIdentifier(
    `revoke-user-sessions:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = revokeUserSessionsSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid input",
    );
  }

  const { userId } = parsed.data;
  const revokedCount = await sessionRepository.revokeAllUserSessions(
    userId,
    admin.uid,
  );

  serverLogger.info("revokeUserSessionsAction", {
    adminId: admin.uid,
    targetUserId: userId,
    revokedCount,
  });

  return { success: true, message: "All user sessions revoked", revokedCount };
}
