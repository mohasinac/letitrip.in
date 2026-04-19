import "@/providers.config";
/**
 * API Route: Delete User Account
 * DELETE /api/profile/delete-account
 */

import { createRouteHandler } from "@mohasinac/appkit/server";
import { successResponse, errorResponse } from "@mohasinac/appkit/server";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit/server";
import { deleteAccountSchema } from "@mohasinac/appkit/server";
import {
  userRepository,
  tokenRepository,
  productRepository,
  orderRepository,
} from "@mohasinac/appkit/server";
import { getAdminAuth } from "@mohasinac/appkit/server";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/server";

export const DELETE = createRouteHandler({
  auth: true,
  schema: deleteAccountSchema,
  handler: async ({ user, request }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.STRICT);
    if (!rl.success) return errorResponse("Too many requests", 429);
    // Delete all user data (cascade delete)
    await tokenRepository.email.deleteAllForUser(user!.uid);
    await tokenRepository.password.deleteAllForUser(user!.uid);

    // Delete user's products and orders via repositories
    await productRepository.deleteBySeller(user!.uid);
    await orderRepository.deleteByUser(user!.uid);

    await userRepository.delete(user!.uid);
    await getAdminAuth().deleteUser(user!.uid);

    return successResponse(null, SUCCESS_MESSAGES.ACCOUNT.DELETED);
  },
});

