/**
 * Admin Payout Detail API Route
 *
 * PATCH /api/admin/payouts/[id] — Update payout status (admin)
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/firebase/auth-server";
import { handleApiError } from "@/lib/errors/error-handler";
import { AuthenticationError, NotFoundError } from "@/lib/errors";
import { requireRole } from "@/lib/security/authorization";
import { payoutRepository, userRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import type { PayoutStatus } from "@/db/schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const updateSchema = z.object({
  status: z.enum(["pending", "processing", "completed", "failed"]),
  adminNote: z.string().optional(),
});

async function getAdminUser() {
  const authUser = await getAuthenticatedUser();
  if (!authUser)
    throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);

  const firestoreUser = await userRepository.findById(authUser.uid);
  if (!firestoreUser)
    throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);

  requireRole({ ...authUser, role: firestoreUser.role || "user" }, [
    "admin",
    "moderator",
  ] as any);

  return authUser;
}

/**
 * PATCH /api/admin/payouts/[id]
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const adminUser = await getAdminUser();
    const { id } = await context.params;

    const payout = await payoutRepository.findById(id);
    if (!payout) throw new NotFoundError(ERROR_MESSAGES.PAYOUT.NOT_FOUND);

    const body = await request.json();
    const validation = updateSchema.safeParse(body);
    if (!validation.success) {
      return ApiErrors.validationError(validation.error.issues);
    }

    const { status, adminNote } = validation.data;

    const updated = await payoutRepository.updateStatus(
      id,
      status as PayoutStatus,
      adminNote ? { adminNote } : undefined,
    );

    serverLogger.info("Payout status updated by admin", {
      payoutId: id,
      adminUid: adminUser.uid,
      newStatus: status,
    });

    return successResponse(updated, SUCCESS_MESSAGES.PAYOUT.UPDATED);
  } catch (error) {
    return handleApiError(error);
  }
}
