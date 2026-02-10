/**
 * API Route: Delete User Account
 * DELETE /api/profile/delete-account
 */

import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import { deleteAccountSchema } from "@/lib/api/validation-schemas";
import {
  userRepository,
  tokenRepository,
  productRepository,
  orderRepository,
} from "@/repositories";
import { getAdminAuth } from "@/lib/firebase/admin";
import { SUCCESS_MESSAGES } from "@/constants";

export const DELETE = createApiHandler({
  auth: true,
  rateLimit: { limit: 3, window: 60 * 60 },
  schema: deleteAccountSchema,
  handler: async ({ user }) => {
    // Delete all user data (cascade delete)
    await tokenRepository.email.deleteAllForUser(user.uid);
    await tokenRepository.password.deleteAllForUser(user.uid);

    // Delete user's products and orders via repositories
    await productRepository.deleteBySeller(user.uid);
    await orderRepository.deleteByUser(user.uid);

    await userRepository.delete(user.uid);
    await getAdminAuth().deleteUser(user.uid);

    return successResponse(null, SUCCESS_MESSAGES.ACCOUNT.DELETED);
  },
});
