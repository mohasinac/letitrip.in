/**
 * API Route: Update User Role/Status (Admin/Moderator)
 * PATCH /api/admin/users/[uid]
 */

import { NextRequest } from "next/server";
import {
  createApiHandler,
  successResponse,
  errorResponse,
} from "@/lib/api/api-handler";
import { userRepository } from "@/repositories";
import { canChangeRole } from "@/lib/security/authorization";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { z } from "zod";

const updateUserSchema = z.object({
  role: z.enum(["user", "seller", "moderator", "admin"]).optional(),
  disabled: z.boolean().optional(),
});

export const PATCH = createApiHandler({
  auth: true,
  roles: ["admin", "moderator"],
  schema: updateUserSchema,
  handler: async ({ request, body, user }) => {
    const uid = request.url.split("/").pop()!;

    if (user && user.uid === uid) {
      return errorResponse(ERROR_MESSAGES.USER.CANNOT_MODIFY_SELF, 403);
    }

    // Get target user's current data
    const targetUser = await userRepository.findById(uid);
    if (!targetUser) {
      return errorResponse(ERROR_MESSAGES.USER.NOT_FOUND, 404);
    }

    // Check role change permissions
    if (body!.role && user) {
      const canChange = canChangeRole(user.role, targetUser.role, body!.role);

      if (!canChange) {
        return errorResponse(
          ERROR_MESSAGES.USER.INSUFFICIENT_ROLE_PERMISSION,
          403,
        );
      }
    }

    await userRepository.update(uid, body!);
    const updatedUser = await userRepository.findById(uid);

    return successResponse(updatedUser, SUCCESS_MESSAGES.USER.USER_UPDATED);
  },
});
