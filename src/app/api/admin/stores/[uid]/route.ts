/**
 * PATCH /api/admin/stores/[uid]
 *
 * Admin endpoint — approve or reject a seller's store.
 * Updates both the StoreDocument.status (stores collection) and
 * UserDocument.storeStatus (users collection) to keep them in sync.
 *
 * Body:
 *   action: "approve" | "reject"
 */

import { z } from "zod";
import { createApiHandler as createRouteHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import { NotFoundError } from "@mohasinac/appkit/errors";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { userRepository, storeRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";

const storeActionSchema = z.object({
  action: z.enum(["approve", "reject"]),
});

export const PATCH = createRouteHandler<
  (typeof storeActionSchema)["_output"],
  { uid: string }
>({
  auth: true,
  roles: ["admin"],
  schema: storeActionSchema,
  handler: async ({ body, params }) => {
    const { uid } = params!;

    const seller = await userRepository.findById(uid);
    if (!seller || (seller.role !== "seller" && seller.role !== "admin")) {
      throw new NotFoundError(ERROR_MESSAGES.USER.NOT_FOUND);
    }

    const { action } = body!;
    const storeStatus: "approved" | "rejected" =
      action === "approve" ? "approved" : "rejected";
    const storeDocStatus: "active" | "rejected" =
      action === "approve" ? "active" : "rejected";

    const successMsg =
      action === "approve"
        ? SUCCESS_MESSAGES.ADMIN.STORE_APPROVED
        : SUCCESS_MESSAGES.ADMIN.STORE_REJECTED;

    // Update user approval flag
    await userRepository.updateStoreApproval(uid, storeStatus);

    // Update the actual StoreDocument status
    if (seller.storeId) {
      const storeSlug = seller.storeSlug;
      if (storeSlug) {
        await storeRepository.setStatus(storeSlug, storeDocStatus);
      }
    }

    serverLogger.info("Admin updated store approval", {
      uid,
      action,
      storeStatus,
    });

    const updated = await userRepository.findById(uid);
    return successResponse(
      { uid: updated!.uid, storeStatus: updated!.storeStatus },
      successMsg,
    );
  },
});
