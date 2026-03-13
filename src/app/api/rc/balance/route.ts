/**
 * GET /api/rc/balance
 *
 * Returns the current RC wallet balance for the authenticated user.
 */

import { userRepository } from "@/repositories";
import { successResponse } from "@/lib/api-response";
import { createApiHandler } from "@/lib/api/api-handler";

export const GET = createApiHandler({
  auth: true,
  handler: async ({ user }) => {
    const userDoc = await userRepository.findById(user!.uid);
    return successResponse({
      rcBalance: userDoc?.rcBalance ?? 0,
      engagedRC: userDoc?.engagedRC ?? 0,
    });
  },
});
