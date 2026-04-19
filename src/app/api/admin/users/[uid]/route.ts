import "@/providers.config";
/**
 * Admin Users [uid] API Route
 * GET    /api/admin/users/:uid — Get a user by UID
 * PATCH  /api/admin/users/:uid — Update user role or status
 * DELETE /api/admin/users/:uid — Disable a user account
 */

import { z } from "zod";
import { successResponse } from "@mohasinac/appkit/next";
import { userRepository } from "@mohasinac/appkit/repositories";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values";

type RouteContext = { params: Promise<{ uid: string }> };

const updateUserSchema = z.object({
  role: z.enum(["user", "seller", "admin", "moderator"]).optional(),
  isDisabled: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
  adminNotes: z.string().optional(),
});

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { uid } = await context.params;
  const user = await userRepository.findById(uid).catch(() => null);
  if (!user) {
    return Response.json(
      { success: false, error: ERROR_MESSAGES.USER.NOT_FOUND },
      { status: 404 },
    );
  }
  return Response.json({ success: true, data: user });
}

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { uid } = await context.params;
  const body = await request.json().catch(() => ({}));
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.format() },
      { status: 400 },
    );
  }

  serverLogger.info("Admin updating user", { uid, ...parsed.data });

  const { isDisabled, emailVerified, ...rest } = parsed.data;

  if (isDisabled === true) {
    await userRepository.disable(uid);
  } else if (isDisabled === false) {
    await userRepository.enable(uid);
  }
  if (emailVerified === true) {
    await userRepository.markEmailAsVerified(uid);
  }
  if (Object.keys(rest).length > 0) {
    await userRepository.update(uid, rest as any);
  }

  return Response.json(successResponse({ uid, ...parsed.data }, SUCCESS_MESSAGES.USER.USER_UPDATED));
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { uid } = await context.params;
  serverLogger.info("Admin disabling user", { uid });
  await userRepository.disable(uid);
  return Response.json(successResponse(null, SUCCESS_MESSAGES.USER.ACCOUNT_DELETED));
}
