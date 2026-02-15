/**
 * API Route: Admin User by UID
 * PATCH /api/admin/users/:uid - Update user (role, disabled, etc.)
 * DELETE /api/admin/users/:uid - Delete user
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { successResponse } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/firebase/auth-server";
import { handleApiError } from "@/lib/errors/error-handler";
import {
  AuthenticationError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import { requireRole } from "@/lib/security/authorization";
import { userRepository } from "@/repositories";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";

const updateUserSchema = z.object({
  role: z.enum(["user", "seller", "moderator", "admin"]).optional(),
  disabled: z.boolean().optional(),
  displayName: z.string().min(1).max(100).optional(),
  emailVerified: z.boolean().optional(),
});

interface RouteContext {
  params: Promise<{ uid: string }>;
}

/**
 * PATCH /api/admin/users/:uid
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    // Auth + role check
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    }
    const firestoreUser = await userRepository.findById(authUser.uid);
    if (!firestoreUser) {
      throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    }
    requireRole({ ...authUser, role: firestoreUser.role || "user" }, ["admin"]);

    const { uid } = await context.params;
    if (!uid) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION.INVALID_INPUT);
    }

    const body = await request.json();
    const validation = updateUserSchema.safeParse(body);
    if (!validation.success) {
      throw new ValidationError(
        ERROR_MESSAGES.VALIDATION.INVALID_INPUT,
        validation.error.flatten().fieldErrors as Record<string, string[]>,
      );
    }

    const existingUser = await userRepository.findById(uid);
    if (!existingUser) {
      throw new NotFoundError(ERROR_MESSAGES.DATABASE.NOT_FOUND);
    }

    const { role, disabled, displayName, emailVerified } = validation.data;

    // Apply updates
    if (role !== undefined) {
      await userRepository.updateRole(uid, role);
      serverLogger.info("Admin updated user role", { uid, role });
    }

    if (disabled !== undefined) {
      if (disabled) {
        await userRepository.disable(uid);
      } else {
        await userRepository.enable(uid);
      }
      serverLogger.info("Admin toggled user disabled", { uid, disabled });
    }

    if (displayName !== undefined) {
      await userRepository.updateProfile(uid, { displayName });
    }

    if (emailVerified === true) {
      await userRepository.markEmailAsVerified(uid);
    }

    const updatedUser = await userRepository.findById(uid);

    return successResponse(updatedUser, SUCCESS_MESSAGES.USER.PROFILE_UPDATED);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/admin/users/:uid
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    // Auth + role check
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    }
    const firestoreUser = await userRepository.findById(authUser.uid);
    if (!firestoreUser) {
      throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    }
    requireRole({ ...authUser, role: firestoreUser.role || "user" }, ["admin"]);

    const { uid } = await context.params;
    if (!uid) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION.INVALID_INPUT);
    }

    const existingUser = await userRepository.findById(uid);
    if (!existingUser) {
      throw new NotFoundError(ERROR_MESSAGES.DATABASE.NOT_FOUND);
    }

    await userRepository.delete(uid);
    serverLogger.info("Admin deleted user", { uid });

    return successResponse(null, SUCCESS_MESSAGES.USER.ACCOUNT_DELETED);
  } catch (error) {
    return handleApiError(error);
  }
}
