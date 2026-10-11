import { withProviders } from "@/providers.config";
/**
 * API Route: Delete User Account
 * DELETE /api/profile/delete-account
 */

import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit/security/rate-limit";
import { deleteAccountSchema } from "@mohasinac/appkit/validation/schemas";
import { tokenRepository } from "@mohasinac/appkit/features/auth/repository/token.repository";
import { userRepository } from "@mohasinac/appkit/features/auth/repository/user.repository";
import { productRepository } from "@mohasinac/appkit/features/products/repository/products.repository";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { orderRepository } from "@mohasinac/appkit";
import { getAdminAuth } from "@mohasinac/appkit/providers/db-firebase/admin";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values/success-messages";

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
    const store = await storeRepository.findByOwnerId(user!.uid);
    if (store) await productRepository.deleteByStore(store.id);
    await orderRepository.deleteByUser(user!.uid);

    await userRepository.delete(user!.uid);
    await getAdminAuth().deleteUser(user!.uid);

    return successResponse(null, SUCCESS_MESSAGES.ACCOUNT.DELETED);
  },
}));
