/**
 * POST /api/user/become-seller
 *
 * Allows an authenticated user with role="user" to apply to become a seller.
 * Sets role="seller" and storeStatus="pending" on the user document.
 * Admin must approve via /api/admin/stores/[uid] before the store goes live.
 */

import { handleApiError } from "@/lib/errors/error-handler";
import { NotFoundError } from "@/lib/errors";
import { requireAuth } from "@/lib/firebase/auth-server";
import { userRepository } from "@/repositories";
import { successResponse } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import type { UserDocument } from "@/db/schema";

export async function POST() {
  try {
    const decoded = await requireAuth();

    const user = await userRepository.findById(decoded.uid);
    if (!user) {
      throw new NotFoundError(ERROR_MESSAGES.USER.NOT_FOUND);
    }

    // If already a seller, return current status rather than error
    if (user.role === "seller" || user.role === "admin") {
      return successResponse({
        alreadySeller: true,
        storeStatus: user.storeStatus ?? "pending",
      });
    }

    // Upgrade to seller role with pending status
    await userRepository.update(decoded.uid, {
      role: "seller",
      storeStatus: "pending",
    } as Partial<UserDocument>);

    serverLogger.info("Seller application submitted", { uid: decoded.uid });

    return successResponse(
      { storeStatus: "pending" },
      SUCCESS_MESSAGES.USER.SELLER_APPLICATION_SUBMITTED,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
