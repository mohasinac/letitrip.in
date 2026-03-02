/**
 * PATCH /api/admin/stores/[uid]
 *
 * Admin endpoint — approve or reject a seller's store.
 * Only accessible by admin-role users.
 *
 * Body:
 *   action: "approve" | "reject"
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { NotFoundError } from "@/lib/errors";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { userRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";

const storeActionSchema = z.object({
  action: z.enum(["approve", "reject"]),
});

interface RouteContext {
  params: Promise<{ uid: string }>;
}

export const PATCH = createApiHandler({
  auth: true,
  roles: ["admin"],
  handler: async ({
    request,
    context,
  }: {
    request: NextRequest;
    context?: RouteContext;
  }) => {
    const { uid } = await context!.params;

    const body = await request.json();
    const validation = storeActionSchema.safeParse(body);
    if (!validation.success) {
      return ApiErrors.validationError(validation.error.issues);
    }

    const seller = await userRepository.findById(uid);
    if (!seller || (seller.role !== "seller" && seller.role !== "admin")) {
      throw new NotFoundError(ERROR_MESSAGES.USER.NOT_FOUND);
    }

    const { action } = validation.data;

    const storeStatus: "approved" | "rejected" =
      action === "approve" ? "approved" : "rejected";
    const successMsg =
      action === "approve"
        ? SUCCESS_MESSAGES.ADMIN.STORE_APPROVED
        : SUCCESS_MESSAGES.ADMIN.STORE_REJECTED;

    await userRepository.updateStoreApproval(uid, storeStatus);

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
