import "@/providers.config";
/**
 * Admin Stores [uid] API Route
 * GET   /api/admin/stores/:uid — Get a store by owner UID
 * PATCH /api/admin/stores/:uid — Update store status (approve/reject/suspend)
 */

import { z } from "zod";
import { successResponse } from "@mohasinac/appkit/next";
import { storeRepository, userRepository } from "@mohasinac/appkit/repositories";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values";

type RouteContext = { params: Promise<{ uid: string }> };

const updateStoreSchema = z.object({
  storeStatus: z.enum(["active", "pending", "suspended", "rejected"]).optional(),
  adminNotes: z.string().optional(),
  isFeatured: z.boolean().optional(),
});

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { uid } = await context.params;
  const users = await userRepository.findByRole("seller" as any).catch(() => []);
  const user = users.find((u: any) => u.id === uid) ?? null;
  if (!user) {
    return Response.json(
      { success: false, error: ERROR_MESSAGES.USER.NOT_FOUND },
      { status: 404 },
    );
  }
  const store = user.storeSlug
    ? await storeRepository.findBySlug(user.storeSlug).catch(() => null)
    : null;
  return Response.json({ success: true, data: { user, store } });
}

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { uid } = await context.params;
  const body = await request.json().catch(() => ({}));
  const parsed = updateStoreSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.format() },
      { status: 400 },
    );
  }

  serverLogger.info("Admin updating store status", { uid, ...parsed.data });

  const { storeStatus, adminNotes, isFeatured } = parsed.data;

  const updateFields: Record<string, unknown> = {};
  if (storeStatus) updateFields.storeStatus = storeStatus;
  if (adminNotes !== undefined) updateFields.adminNotes = adminNotes;
  if (isFeatured !== undefined) updateFields.isFeatured = isFeatured;

  await userRepository.update(uid, updateFields as any);

  const message = storeStatus === "active"
    ? SUCCESS_MESSAGES.ADMIN.STORE_APPROVED
    : storeStatus === "rejected"
    ? SUCCESS_MESSAGES.ADMIN.STORE_REJECTED
    : SUCCESS_MESSAGES.USER.STORE_UPDATED;

  return Response.json(successResponse({ uid, storeStatus }, message));
}
