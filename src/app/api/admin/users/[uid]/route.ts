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
      return errorResponse("You cannot modify your own account", 403);
    }

    // Get target user's current data
    const targetUser = await userRepository.findById(uid);
    if (!targetUser) {
      return errorResponse("User not found", 404);
    }

    // Check role change permissions
    if (body!.role && user) {
      const canChange = canChangeRole(user.role, targetUser.role, body!.role);

      if (!canChange) {
        return errorResponse(
          "You do not have permission to assign this role",
          403,
        );
      }
    }

    await userRepository.update(uid, body!);
    const updatedUser = await userRepository.findById(uid);

    return successResponse(updatedUser, "User updated successfully");
  },
});
