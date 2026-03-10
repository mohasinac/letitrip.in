/**
 * API Route: Admin User by UID
 * PATCH /api/admin/users/:uid - Update user (role, disabled, etc.)
 * DELETE /api/admin/users/:uid - Delete user
 */

import { z } from "zod";
import { successResponse } from "@/lib/api-response";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { userRepository } from "@/repositories";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import { createApiHandler } from "@/lib/api/api-handler";
import { RateLimitPresets } from "@/lib/security/rate-limit";

type UidParams = { uid: string };

const updateUserSchema = z.object({
  role: z.enum(["user", "seller", "moderator", "admin"]).optional(),
  disabled: z.boolean().optional(),
  displayName: z.string().min(1).max(100).optional(),
  emailVerified: z.boolean().optional(),
});

/**
 * PATCH /api/admin/users/:uid
 */
export const PATCH = createApiHandler<
  (typeof updateUserSchema)["_output"],
  UidParams
>({
  roles: ["admin"],
  rateLimit: RateLimitPresets.STRICT,
  schema: updateUserSchema,
  handler: async ({ body, params }) => {
    const { uid } = params!;
    if (!uid)
      throw new ValidationError(ERROR_MESSAGES.VALIDATION.INVALID_INPUT);

    const existingUser = await userRepository.findById(uid);
    if (!existingUser)
      throw new NotFoundError(ERROR_MESSAGES.DATABASE.NOT_FOUND);

    const { role, disabled, displayName, emailVerified } = body!;

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
  },
});

/**
 * DELETE /api/admin/users/:uid
 */
export const DELETE = createApiHandler<never, UidParams>({
  roles: ["admin"],
  rateLimit: RateLimitPresets.STRICT,
  handler: async ({ params }) => {
    const { uid } = params!;
    if (!uid)
      throw new ValidationError(ERROR_MESSAGES.VALIDATION.INVALID_INPUT);

    const existingUser = await userRepository.findById(uid);
    if (!existingUser)
      throw new NotFoundError(ERROR_MESSAGES.DATABASE.NOT_FOUND);

    await userRepository.delete(uid);
    serverLogger.info("Admin deleted user", { uid });
    return successResponse(null, SUCCESS_MESSAGES.USER.ACCOUNT_DELETED);
  },
});
