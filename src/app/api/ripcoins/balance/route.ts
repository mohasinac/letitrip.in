/**
 * GET /api/ripcoins/balance
 *
 * Returns the current RipCoin wallet balance for the authenticated user.
 */

import { userRepository } from "@/repositories";
import { successResponse } from "@/lib/api-response";
import { createApiHandler } from "@/lib/api/api-handler";

export const GET = createApiHandler({
  auth: true,
  handler: async ({ user }) => {
    const userDoc = await userRepository.findById(user!.uid);
    return successResponse({
      ripcoinBalance: userDoc?.ripcoinBalance ?? 0,
      engagedRipcoins: userDoc?.engagedRipcoins ?? 0,
    });
  },
});
