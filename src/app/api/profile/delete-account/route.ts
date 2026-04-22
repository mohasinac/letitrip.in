import { withProviders } from "@/providers.config";
/**
 * API Route: Delete User Account
 * DELETE /api/profile/delete-account
 */

import { createRouteHandler } from "@mohasinac/appkit";
import { successResponse, errorResponse } from "@mohasinac/appkit";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit";
import { deleteAccountSchema } from "@mohasinac/appkit";
import {
  userRepository,
  tokenRepository,
  productRepository,
  orderRepository,
} from "@mohasinac/appkit";
import { getAdminAuth } from "@mohasinac/appkit";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit";

export const DELETE = withProviders(createRouteHandler({
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
}));

