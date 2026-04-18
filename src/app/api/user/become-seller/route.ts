/**
 * POST /api/user/become-seller
 *
 * Allows an authenticated user with role="user" to apply to become a seller.
 * Sets role="seller" and storeStatus="pending" on the user document.
 * Admin must approve via /api/admin/stores/[uid] before the store goes live.
 */

import { userRepository } from "@mohasinac/appkit/repositories";
import { successResponse } from "@mohasinac/appkit/next";
import { createApiHandler } from "@mohasinac/appkit/http";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import type { UserDocument } from "@mohasinac/appkit/features/auth";
import { StoreStatusValues } from "@mohasinac/appkit/features/stores";

export const POST = createApiHandler({
  auth: true,
  handler: async ({ user }) => {
    // If already a seller, return current status rather than error
    if (user!.role === "seller" || user!.role === "admin") {
      return successResponse({
        alreadySeller: true,
        storeStatus: user!.storeStatus ?? StoreStatusValues.PENDING,
      });
    }

    // Upgrade to seller role with pending status
    await userRepository.update(user!.uid, {
      role: "seller",
      storeStatus: StoreStatusValues.PENDING,
    } as Partial<UserDocument>);

    serverLogger.info("Seller application submitted", { uid: user!.uid });

    return successResponse(
      { storeStatus: StoreStatusValues.PENDING },
      SUCCESS_MESSAGES.USER.SELLER_APPLICATION_SUBMITTED,
    );
  },
});

