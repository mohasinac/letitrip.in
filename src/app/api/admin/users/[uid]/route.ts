/**
 * API Route: Update User Role/Status (Admin Only)
 * PATCH /api/admin/users/[uid]
 */

import { NextRequest } from "next/server";
import {
  createApiHandler,
  successResponse,
  errorResponse,
} from "@/lib/api/api-handler";
import { userRepository } from "@/repositories";
import { z } from "zod";

const updateUserSchema = z.object({
  role: z.enum(["user", "moderator", "admin"]).optional(),
  disabled: z.boolean().optional(),
});

export const PATCH = createApiHandler({
  auth: true,
  roles: ["admin"],
  schema: updateUserSchema,
  handler: async ({ request, body, user }) => {
    const uid = request.url.split("/").pop()!;

    if (user && user.uid === uid) {
      return errorResponse("You cannot modify your own account", 403);
    }

    await userRepository.update(uid, body!);
    const updatedUser = await userRepository.findById(uid);

    return successResponse(updatedUser, "User updated successfully");
  },
});
