import { withProviders } from "@/providers.config";
/**
 * GET /api/seller/store/addresses — List pickup addresses for the seller's store.
 *
 * The seller's store slug is resolved from their user record.
 * Returns an array of StoreAddressDocument objects.
 *
 * Mutations (create/update/delete) use Server Actions.
 */

import { storeRepository, storeAddressRepository } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import { createApiHandler as createRouteHandler } from "@mohasinac/appkit";
import { NotFoundError } from "@mohasinac/appkit";
import { ERROR_MESSAGES } from "@mohasinac/appkit";

export const GET = withProviders(createRouteHandler({
  auth: true,
  roles: ["seller", "admin"],
  handler: async ({ user }) => {
    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store?.storeSlug)
      throw new NotFoundError(ERROR_MESSAGES.GENERIC.NOT_FOUND);

    const addresses = await storeAddressRepository.findByStore(store.storeSlug);
    return successResponse(addresses);
  },
}));

