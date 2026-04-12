/**
 * POST /api/user/become-seller
 *
 * Allows an authenticated user with role="user" to apply to become a seller.
 * Sets role="seller" and storeStatus="pending" on the user document.
 * Admin must approve via /api/admin/stores/[uid] before the store goes live.
 */

import { userRepository } from "@/repositories";
import { successResponse } from "@mohasinac/appkit/next";
import { createApiHandler } from "@/lib/api/api-handler";
import { SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import type { UserDocument } from "@/db/schema";

export const POST = createApiHandler({
  auth: true,
  handler: async ({ user }) => {
    // If already a seller, return current status rather than error
    if (user!.role === "seller" || user!.role === "admin") {
      return successResponse({
        alreadySeller: true,
        storeStatus: user!.storeStatus ?? "pending",
      });
    }

    // Upgrade to seller role with pending status
    await userRepository.update(user!.uid, {
      role: "seller",
      storeStatus: "pending",
    } as Partial<UserDocument>);

    serverLogger.info("Seller application submitted", { uid: user!.uid });

    return successResponse(
      { storeStatus: "pending" },
      SUCCESS_MESSAGES.USER.SELLER_APPLICATION_SUBMITTED,
    );
  },
});
