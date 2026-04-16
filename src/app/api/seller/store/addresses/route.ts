import "@/providers.config";
/**
 * GET /api/seller/store/addresses — List pickup addresses for the seller's store.
 *
 * The seller's store slug is resolved from their user record.
 * Returns an array of StoreAddressDocument objects.
 *
 * Mutations (create/update/delete) use Server Actions.
 */

import { storeRepository, storeAddressRepository } from "@mohasinac/appkit/repositories";
import { successResponse } from "@mohasinac/appkit/next";
import { createApiHandler as createRouteHandler } from "@mohasinac/appkit/http";
import { NotFoundError } from "@mohasinac/appkit/errors";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors";

export const GET = createRouteHandler({
  auth: true,
  roles: ["seller", "admin"],
  handler: async ({ user }) => {
    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store?.storeSlug)
      throw new NotFoundError(ERROR_MESSAGES.GENERIC.NOT_FOUND);

    const addresses = await storeAddressRepository.findByStore(store.storeSlug);
    return successResponse(addresses);
  },
});

