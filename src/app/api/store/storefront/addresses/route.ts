import { withProviders } from "@/providers.config";
/**
 * GET /api/store/store/addresses — List pickup addresses for the seller's store.
 *
 * The seller's store slug is resolved from their user record.
 * Returns an array of AddressDocument objects (ownerType:"store" filter).
 *
 * Mutations (create/update/delete) use Server Actions.
 */

import { addressesRepository } from "@mohasinac/appkit/features/addresses/repository/addresses.repository";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { NotFoundError } from "@mohasinac/appkit/errors/not-found-error";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors/messages";
import { ROLES_STORE_WRITE } from "@/constants";

export const GET = withProviders(createRouteHandler({
  auth: true,
  roles: [...ROLES_STORE_WRITE],
  handler: async ({ user }) => {
    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store?.storeSlug)
      throw new NotFoundError(ERROR_MESSAGES.GENERIC.NOT_FOUND);

    const addresses = await addressesRepository.listByOwner("store", store.storeSlug);
    return successResponse(addresses);
  },
}));
