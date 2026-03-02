/**
 * GET /api/ripcoins/balance
 *
 * Returns the current RipCoin wallet balance for the authenticated user.
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/firebase/auth-server";
import { userRepository } from "@/repositories";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse } from "@/lib/api-response";
import { serverLogger } from "@/lib/server-logger";

export async function GET(_request: NextRequest) {
  try {
    const user = await requireAuth();

    const userDoc = await userRepository.findById(user.uid);

    return successResponse({
      ripcoinBalance: userDoc?.ripcoinBalance ?? 0,
      engagedRipcoins: userDoc?.engagedRipcoins ?? 0,
    });
  } catch (error) {
    serverLogger.error("GET /api/ripcoins/balance error", { error });
    return handleApiError(error);
  }
}
